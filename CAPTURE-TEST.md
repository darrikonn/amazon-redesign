# CAPTURE-TEST

## Tool and model

- Tool: Claude Code 2.1.287, running in the Claude desktop app (Code tab), macOS.
- Model: `claude-fable-5-1` (Claude Fable 5.1). One model does both planning and
  execution. No separate planner model, no subagents were used for the capture setup.

## Mechanism

Claude Code lifecycle hooks, configured at the project level so they travel with the repo.

- Config file changed: [`.claude/settings.json`](.claude/settings.json)
- Hook script added: [`.claude/hooks/capture.py`](.claude/hooks/capture.py) (Python 3, stdlib only)
- Events wired:
  - `UserPromptSubmit` -> `capture.py prompt`. Claude Code passes a JSON object on stdin
    with `session_id`, `transcript_path` and the verbatim `prompt`. The script appends a
    `PROMPT` entry.
  - `Stop` -> `capture.py stop`. Fires when the agent finishes a turn. Stdin carries
    `session_id`, `transcript_path` and `last_assistant_message` (the final response
    text). The script appends a `RESPONSE` entry. If `last_assistant_message` is absent
    it falls back to parsing the transcript JSONL for the closing text blocks of the turn.
- Model name comes from the `message.model` field of the most recent assistant entry in
  the session transcript. On the very first prompt of a fresh session there is no
  assistant entry yet, so the prompt entry is written with `unknown` and the Stop hook
  backfills it once the model has answered.
- Only prompt and final response are written. Thinking, tool calls, tool results and
  intermediate text are not captured.
- The hook fires on its own. Nothing is run manually. The script always exits 0 so a
  logging bug can never block a prompt.

## Log files the canaries landed in

- Session 1 (the session that installed the hook):
  [`.agent-logs/2026-10-14_12-53-57_fba23c73-d743-4512-9aa3-808d2817d045.md`](.agent-logs/2026-10-14_12-53-57_fba23c73-d743-4512-9aa3-808d2817d045.md)
- Session 2 (fresh session, proves the hook is installed and not session-local):
  [`.agent-logs/2026-10-14_12-57-39_c0fdecd4-030e-4a8f-91ff-8a90dbae4069.md`](.agent-logs/2026-10-14_12-57-39_c0fdecd4-030e-4a8f-91ff-8a90dbae4069.md)

## Canary 1, session fba23c73 (raw)

```
[LOG_ENTRY type=PROMPT num=1 session=fba23c73]
timestamp: 2026-10-14T12:55:46.459Z
model: claude-fable-5-1

CAPTURE TEST — 8x assignment, Darri Konn


[LOG_ENTRY type=RESPONSE num=1 session=fba23c73]
timestamp: 2026-10-14T12:57:22.989Z
model: claude-fable-5-1

Capture is confirmed working in this session.

**What landed in `.agent-logs/2026-10-14_12-53-57_fba23c73-d743-4512-9aa3-808d2817d045.md`:**
- Your canary prompt, verbatim, as PROMPT num 1 with a UTC timestamp and model `claude-fable-5-1`.
- My previous reply, logged by the Stop hook. It appears as an orphan RESPONSE num 1 above the prompt, because your very first message predates the hook. I am leaving that entry as is and will explain it in `CAPTURE-TEST.md`.
- This reply will land as RESPONSE num 1 when the turn ends.

**Fixed along the way:** the response-numbering rule now pairs each response with the PROMPT entry directly before it, so the orphan no longer shifts later numbers. Verified with a dry run and committed as `0103860`.

**Next, from you:** open a second Claude Code session in this same repo, send `CAPTURE TEST — 8x assignment, Darri Konn` there, then come back here and tell me. I will then verify the second log file, write `CAPTURE-TEST.md` with both canary entries pasted raw, and commit the logs.
```

## Canary 2, session c0fdecd4 (raw)

```
[LOG_ENTRY type=PROMPT num=1 session=c0fdecd4]
timestamp: 2026-10-14T12:57:39.061Z
model: claude-fable-5-1

CAPTURE TEST — 8x assignment, Darri Konn


[LOG_ENTRY type=RESPONSE num=1 session=c0fdecd4]
timestamp: 2026-10-14T12:57:57.452Z
model: claude-fable-5-1

Capture is working in this second session.

**What landed in `.agent-logs/2026-10-14_12-57-39_c0fdecd4-030e-4a8f-91ff-8a90dbae4069.md`:**
- A new log file was created for this session with frontmatter and the session header.
- Your canary prompt, verbatim, as PROMPT num 1 with a UTC timestamp.
- This reply should land as RESPONSE num 1 when the turn ends.

**One discrepancy worth noting:** the model field reads `unknown` in this session's log, both in the frontmatter and on the PROMPT entry. The first session's log recorded `claude-fable-5-1`. The UserPromptSubmit hook likely reads the model from a field that is absent on the very first prompt of a fresh session, so the first session only had it because the hook was installed mid-session. The Stop hook may fill it in on the response entry. Worth checking in the other session before writing CAPTURE-TEST.md.

You can now go back to the first session and report that both canaries are done.
```

## Things that did not work first, or that are worth knowing

1. **Dry-run JSON failure.** My first smoke test of the script piped a JSON payload
   through `echo` in zsh, which expanded the `\n` inside the string into a real newline
   and produced invalid JSON. The script correctly swallowed the error (it is logged in
   `~/.claude/8x-capture-errors.log`, outside the repo) and exited 0. The test input was
   the problem, not the hook. Switched the test to `printf`/Python-generated JSON.

2. **Orphan RESPONSE at the top of session 1's log.** The hook was installed mid-session,
   so the Stop hook fired for the turn that installed it before any PROMPT had been
   logged. That shows up as a `RESPONSE num=1` entry above `PROMPT num=1`. My original
   numbering rule would then have labelled the canary's response `num=2`. I changed the
   rule so a response always takes the number of the PROMPT entry directly before it,
   and an orphan Stop gets the next free number. The orphan entry in the log is left
   as is, untouched, per the "do not edit after the fact" rule.

3. **Model `unknown` on the first prompt of a fresh session.** Session 2's response
   (visible in canary 2 above) flagged that its PROMPT entry said `unknown` at write
   time. That is the expected first-prompt gap described under Mechanism, and the Stop
   hook backfilled it to `claude-fable-5-1` in the same file. Session 1 did not show
   this because the hook was installed after the model had already answered once.

4. **Hot reload.** The docs say settings-file hook edits are picked up by a file
   watcher. That held: the hooks fired in the installing session without a restart.
   I had flagged a restart as a possible failure mode beforehand. It was not needed.
