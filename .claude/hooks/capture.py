#!/usr/bin/env python3
"""
Agent capture hook for Claude Code.

Wired in .claude/settings.json to two lifecycle events:
  - UserPromptSubmit  -> `capture.py prompt`  : appends a PROMPT entry (verbatim prompt)
  - Stop              -> `capture.py stop`    : appends a RESPONSE entry (final assistant text)

Both receive a JSON object on stdin from Claude Code. Writes one markdown file per
session to .agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md in the repo root.

Only the prompt and the final response are recorded. Thinking, tool calls and
intermediate text are deliberately not captured. Nothing is ever edited after
the fact except the frontmatter counters (total_exchanges, last_prompt_time, model)
and the model name on a PROMPT entry when it was not yet known at prompt time.

Design rule: this script must never fail the hook. Any exception is swallowed and
written to ~/.claude/8x-capture-errors.log, and the script exits 0, so a logging
bug can never block a prompt or a turn.
"""
import glob
import json
import os
import re
import sys
from datetime import datetime, timezone

TOOL = "claude-code"
AUTHOR = "darrikonn"
ERR_LOG = os.path.expanduser("~/.claude/8x-capture-errors.log")


def now_iso():
    t = datetime.now(timezone.utc)
    return t.strftime("%Y-%m-%dT%H:%M:%S.") + f"{t.microsecond // 1000:03d}Z"


def project_dir():
    return os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()


def log_dir():
    d = os.path.join(project_dir(), ".agent-logs")
    os.makedirs(d, exist_ok=True)
    return d


def session_file(session_id):
    """Find the existing log for this session, or build a new filename."""
    matches = sorted(glob.glob(os.path.join(log_dir(), f"*_{session_id}.md")))
    if matches:
        return matches[0], False
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
    return os.path.join(log_dir(), f"{stamp}_{session_id}.md"), True


def read_transcript(path):
    """Yield parsed JSONL entries; tolerate a missing/partial file."""
    if not path:
        return []
    path = os.path.expanduser(path)
    out = []
    try:
        with open(path, encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    out.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    except OSError:
        pass
    return out


def model_from_transcript(entries):
    """Model of the most recent main-thread assistant message, or None."""
    for e in reversed(entries):
        if e.get("type") == "assistant" and not e.get("isSidechain"):
            m = (e.get("message") or {}).get("model")
            if m:
                return m
    return None


def model_from_settings():
    for p in (os.path.expanduser("~/.claude/settings.json"),
              os.path.join(project_dir(), ".claude", "settings.json")):
        try:
            with open(p, encoding="utf-8") as fh:
                m = json.load(fh).get("model")
                if isinstance(m, str) and m:
                    return m
        except Exception:
            pass
    return os.environ.get("ANTHROPIC_MODEL")


def final_response_from_transcript(entries):
    """
    Fallback when stdin lacks last_assistant_message: concatenate the assistant
    text blocks that come after the last tool_result (i.e. the closing text of
    the turn), skipping sidechain (subagent) entries.
    """
    texts = []
    for e in entries:
        if e.get("isSidechain"):
            continue
        t = e.get("type")
        msg = e.get("message") or {}
        content = msg.get("content")
        if t == "user":
            # A real prompt or a tool_result both reset the "final text" window.
            texts = []
        elif t == "assistant" and isinstance(content, list):
            for block in content:
                if block.get("type") == "text" and block.get("text"):
                    texts.append(block["text"])
                elif block.get("type") == "tool_use":
                    texts = []
    return "\n\n".join(texts).strip()


FM_RE = re.compile(r"\A---\n(.*?)\n---\n", re.S)


def parse_frontmatter(text):
    m = FM_RE.match(text)
    fm = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip()
    return fm, m


def render_frontmatter(fm):
    keys = ["session_id", "date", "author", "model", "tool", "project",
            "total_exchanges", "first_prompt_time", "last_prompt_time"]
    body = "\n".join(f"{k}: {fm.get(k, '')}" for k in keys)
    return f"---\n{body}\n---\n"


def count_entries(text, kind):
    return len(re.findall(rf"^\[LOG_ENTRY type={kind} num=\d+ session=", text, re.M))


ENTRY_RE = re.compile(r"^\[LOG_ENTRY type=(PROMPT|RESPONSE) num=(\d+) session=", re.M)


def last_entry(text):
    found = ENTRY_RE.findall(text)
    return (found[-1][0], int(found[-1][1])) if found else (None, 0)


def max_entry_num(text):
    return max((int(n) for _, n in ENTRY_RE.findall(text)), default=0)


def load_or_init(path, is_new, session_id, model, ts):
    short = session_id[:8]
    project = os.path.basename(project_dir())
    if is_new or not os.path.exists(path):
        fm = {
            "session_id": session_id,
            "date": ts[:10],
            "author": AUTHOR,
            "model": model,
            "tool": TOOL,
            "project": project,
            "total_exchanges": "0",
            "first_prompt_time": ts,
            "last_prompt_time": ts,
        }
        body = (f"\n# Session Log - {ts[:10]}\n\n"
                f"Session: `{short}` | Project: `{project}` | Author: `{AUTHOR}`\n\n---\n")
        return fm, body
    with open(path, encoding="utf-8") as fh:
        text = fh.read()
    fm, m = parse_frontmatter(text)
    body = text[m.end():] if m else text
    return fm, body


def write(path, fm, body):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        fh.write(render_frontmatter(fm) + body)
    os.replace(tmp, path)


def entry(kind, num, short, ts, model, text):
    return (f"\n[LOG_ENTRY type={kind} num={num} session={short}]\n"
            f"timestamp: {ts}\nmodel: {model}\n\n{text.rstrip()}\n\n")


def handle_prompt(data):
    session_id = data.get("session_id") or "unknown-session"
    prompt = data.get("prompt")
    if prompt is None:
        prompt = ""
    entries = read_transcript(data.get("transcript_path"))
    model = model_from_transcript(entries) or model_from_settings() or "unknown"
    ts = now_iso()
    path, is_new = session_file(session_id)
    fm, body = load_or_init(path, is_new, session_id, model, ts)
    num = count_entries(body, "PROMPT") + 1
    body += entry("PROMPT", num, session_id[:8], ts, model, prompt)
    fm["total_exchanges"] = str(num)
    fm["last_prompt_time"] = ts
    if not fm.get("first_prompt_time"):
        fm["first_prompt_time"] = ts
    if model != "unknown":
        fm["model"] = model
    write(path, fm, body)


def handle_stop(data):
    session_id = data.get("session_id") or "unknown-session"
    entries = read_transcript(data.get("transcript_path"))
    model = model_from_transcript(entries) or model_from_settings() or "unknown"
    text = data.get("last_assistant_message")
    if not text:
        text = final_response_from_transcript(entries)
    if not text:
        text = "(empty response: the turn ended with no final assistant text)"
    ts = now_iso()
    path, is_new = session_file(session_id)
    fm, body = load_or_init(path, is_new, session_id, model, ts)
    prompts = count_entries(body, "PROMPT")
    # Pair with the PROMPT entry directly before this response. If the last
    # entry is already a RESPONSE (a Stop with no logged prompt, e.g. the hook
    # was installed mid-session), record an orphan with the next free number.
    last_kind, last_num = last_entry(body)
    num = last_num if last_kind == "PROMPT" else max_entry_num(body) + 1
    # Backfill the model on this exchange's PROMPT entry if it was unknown then.
    if model != "unknown":
        body = re.sub(
            rf"(\[LOG_ENTRY type=PROMPT num={num} session=[^\]]+\]\ntimestamp: [^\n]+\nmodel: )unknown",
            rf"\g<1>{model}", body, count=1)
        fm["model"] = model
    body += entry("RESPONSE", num, session_id[:8], ts, model, text)
    fm["total_exchanges"] = str(max(prompts, num))
    write(path, fm, body)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else ""
    raw = sys.stdin.read()
    data = json.loads(raw) if raw.strip() else {}
    if mode == "prompt":
        handle_prompt(data)
    elif mode == "stop":
        handle_stop(data)
    else:
        raise ValueError(f"unknown mode {mode!r}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # never block the agent because of a logging bug
        try:
            with open(ERR_LOG, "a", encoding="utf-8") as fh:
                fh.write(f"{now_iso()} {sys.argv[1:]} {type(exc).__name__}: {exc}\n")
        except Exception:
            pass
        print(f"capture hook error: {exc}", file=sys.stderr)
    sys.exit(0)
