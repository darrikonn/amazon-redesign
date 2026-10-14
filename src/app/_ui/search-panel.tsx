import {
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
  useId,
  useLayoutEffect,
} from "react";
import type { AssistantSuggestion, SearchOutcome } from "@/use-case";
import { resultCountLabel } from "./format";
import { Icon } from "./icon";
import styles from "./search-panel.module.css";

type SearchPanelProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  text: string;
  outcome: SearchOutcome;
  placeholder: string;
  previewLabels: readonly string[];
  assistant: AssistantState | null;
  onTextChange: (text: string) => void;
  onTryExample: () => void;
};

export type AssistantState =
  | { forText: string; status: "thinking"; words: readonly string[] }
  | { forText: string; status: "suggested"; suggestion: AssistantSuggestion };

export function SearchPanel({
  inputRef,
  text,
  outcome,
  placeholder,
  previewLabels,
  assistant,
  onTextChange,
  onTryExample,
}: SearchPanelProps) {
  const inputId = useId();
  const hasQuery = text.trim() !== "";
  useAutoGrow(inputRef);

  function clear() {
    onTextChange("");
    inputRef.current?.focus();
  }

  return (
    <div className={styles.bar}>
      <div className={styles.inputRow}>
        <Icon name="search" size={22} strokeWidth={2.4} className={styles.searchIcon} />
        <label htmlFor={inputId} className="visually-hidden">
          Describe what you are looking for
        </label>
        <textarea
          id={inputId}
          ref={inputRef}
          className={hasQuery ? styles.input : styles.inputEmpty}
          rows={1}
          value={text}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onTextChange(event.target.value)}
          onKeyDown={(event) => handleKey(event, clear)}
        />
        {hasQuery ? (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Clear search"
            onClick={clear}
          >
            <Icon name="close" size={18} strokeWidth={2.6} />
          </button>
        ) : (
          <button
            type="button"
            className={styles.goButton}
            aria-label="Try this example"
            onClick={onTryExample}
          >
            <Icon name="arrow-right" size={24} strokeWidth={2.6} />
          </button>
        )}
      </div>
      {hasQuery ? (
        <>
          <UnderstoodRow outcome={outcome} onTextChange={onTextChange} />
          {assistant !== null && <AssistantRow assistant={assistant} onTextChange={onTextChange} />}
          <RefinementRow outcome={outcome} onTextChange={onTextChange} />
        </>
      ) : (
        <PreviewRow labels={previewLabels} />
      )}
    </div>
  );
}

const MINIMUM_INPUT_HEIGHT = 56;

// Runs after every render because the text can change from a chip as well as from typing.
function useAutoGrow(inputRef: RefObject<HTMLTextAreaElement | null>) {
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input === null) return;
    input.style.height = "auto";
    input.style.height = `${Math.max(MINIMUM_INPUT_HEIGHT, input.scrollHeight)}px`;
  });
}

// Enter would add a newline to the textarea; the results are already live, so it only
// closes the on-screen keyboard on touch devices.
function handleKey(event: KeyboardEvent<HTMLTextAreaElement>, clear: () => void) {
  if (event.key === "Escape") clear();
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (window.matchMedia("(pointer: coarse)").matches) event.currentTarget.blur();
}

function UnderstoodRow({ outcome, onTextChange }: RowProps) {
  return (
    <div className={styles.understoodRow}>
      <span className={styles.rowLabel}>Understood</span>
      {outcome.understood.length === 0 ? (
        <span className={styles.nothingYet}>Nothing specific yet. Keep typing.</span>
      ) : (
        outcome.understood.map((term) => (
          <button
            type="button"
            key={term.label}
            className={styles.understoodChip}
            aria-label={`Remove ${term.label}`}
            onClick={() => onTextChange(term.textWithoutTerm)}
          >
            {term.label}
            <Icon name="close" size={14} strokeWidth={3} className={styles.chipIcon} />
          </button>
        ))
      )}
      <span className={styles.resultCount}>{resultCountLabel(outcome.resultCount)}</span>
    </div>
  );
}

type RowProps = {
  outcome: SearchOutcome;
  onTextChange: (text: string) => void;
};

type AssistantRowProps = {
  assistant: AssistantState;
  onTextChange: (text: string) => void;
};

function AssistantRow({ assistant, onTextChange }: AssistantRowProps) {
  return (
    <div className={styles.assistantRow} aria-live="polite">
      <span className={styles.rowLabel}>Assistant</span>
      <AssistantContent assistant={assistant} onTextChange={onTextChange} />
    </div>
  );
}

function AssistantContent({ assistant, onTextChange }: AssistantRowProps) {
  if (assistant.status === "thinking") {
    return (
      <span className={styles.assistantNote}>
        Thinking about {assistant.words.map((word) => `“${word}”`).join(", ")}…
      </span>
    );
  }
  return (
    <button
      type="button"
      className={styles.assistantSuggestion}
      onClick={() => onTextChange(assistant.suggestion.text)}
    >
      <Icon name="sparkle" size={16} strokeWidth={2.2} className={styles.assistantIcon} />
      Try “{assistant.suggestion.text}”
      <span className={styles.refinementCount}>
        {resultCountLabel(assistant.suggestion.resultCount)}
      </span>
    </button>
  );
}

function RefinementRow({ outcome, onTextChange }: RowProps) {
  if (outcome.refinements.length === 0) return null;
  return (
    <div className={styles.refinementRow}>
      <span className={styles.refinementLabel}>Add a detail</span>
      <div className={styles.refinementScroller}>
        {outcome.refinements.map((refinement) => (
          <button
            type="button"
            key={refinement.label}
            className={styles.refinementChip}
            onClick={() => onTextChange(refinement.text)}
          >
            <Icon name="plus" size={14} strokeWidth={3} className={styles.chipIcon} />
            {refinement.label}
            <span className={styles.refinementCount}>
              {resultCountLabel(refinement.resultCount)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewRow({ labels }: { labels: readonly string[] }) {
  return (
    <div className={styles.previewRow} aria-hidden="true">
      <span className={styles.previewLabel}>Would set</span>
      {labels.map((label) => (
        <span key={label} className={styles.previewChip}>
          {label}
        </span>
      ))}
    </div>
  );
}
