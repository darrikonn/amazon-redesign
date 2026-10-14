import {
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
  useId,
  useLayoutEffect,
} from "react";
import type { SearchOutcome, SuggestionView } from "@/use-case";
import { Collapsible } from "./collapsible";
import { resultCountLabel } from "./format";
import { Icon } from "./icon";
import styles from "./search-panel.module.css";

type SearchPanelProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  text: string;
  results: SearchOutcome | null;
  isShowingResults: boolean;
  isUpdating: boolean;
  placeholder: string;
  onType: (text: string) => void;
  onApply: (text: string) => void;
  onPick: (text: string) => void;
  onTryExample: () => void;
};

export function SearchPanel({
  inputRef,
  text,
  results,
  isShowingResults,
  isUpdating,
  placeholder,
  onType,
  onApply,
  onPick,
  onTryExample,
}: SearchPanelProps) {
  const inputId = useId();
  const hasQuery = text.trim() !== "";
  useAutoGrow(inputRef, text);

  function clear() {
    onApply("");
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
          onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onType(event.target.value)}
          onKeyDown={(event) => handleKey(event, { clear, submit: () => onApply(text) })}
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
      <Collapsible isOpen={isShowingResults}>
        {results !== null && (
          <div className={isUpdating ? styles.rowsUpdating : styles.rows} aria-busy={isUpdating}>
            <UnderstoodRow outcome={results} onPick={onPick} />
            {results.assistantSuggestion !== null && (
              <AssistantRow suggestion={results.assistantSuggestion} onPick={onPick} />
            )}
            <RefinementRow outcome={results} onPick={onPick} />
          </div>
        )}
      </Collapsible>
    </div>
  );
}

const MINIMUM_INPUT_HEIGHT = 56;

// Grows with the text, which can change from a chip as well as from typing. The page's
// scroll position is restored because collapsing the box to measure it can shorten the
// page for an instant.
function useAutoGrow(inputRef: RefObject<HTMLTextAreaElement | null>, text: string) {
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input === null || input.value !== text) return;
    const scrollTop = window.scrollY;
    input.style.height = "auto";
    input.style.height = `${Math.max(MINIMUM_INPUT_HEIGHT, input.scrollHeight)}px`;
    if (window.scrollY !== scrollTop) window.scrollTo({ top: scrollTop });
  }, [inputRef, text]);
}

type KeyActions = {
  clear: () => void;
  submit: () => void;
};

// Enter would add a newline to the textarea; instead it searches at once, without waiting
// for the typing pause, and closes the on-screen keyboard on touch devices.
function handleKey(event: KeyboardEvent<HTMLTextAreaElement>, actions: KeyActions) {
  if (event.key === "Escape") actions.clear();
  if (event.key !== "Enter") return;
  event.preventDefault();
  actions.submit();
  if (window.matchMedia("(pointer: coarse)").matches) event.currentTarget.blur();
}

function UnderstoodRow({ outcome, onPick }: RowProps) {
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
            onClick={() => onPick(term.textWithoutTerm)}
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
  onPick: (text: string) => void;
};

type AssistantRowProps = {
  suggestion: SuggestionView;
  onPick: (text: string) => void;
};

function AssistantRow({ suggestion, onPick }: AssistantRowProps) {
  return (
    <div className={styles.assistantRow}>
      <span className={styles.rowLabel}>Assistant</span>
      <button
        type="button"
        className={styles.assistantSuggestion}
        onClick={() => onPick(suggestion.text)}
      >
        <Icon name="sparkle" size={16} strokeWidth={2.2} className={styles.assistantIcon} />
        {suggestion.label}
        <span className={styles.refinementCount}>{resultCountLabel(suggestion.resultCount)}</span>
      </button>
    </div>
  );
}

function RefinementRow({ outcome, onPick }: RowProps) {
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
            onClick={() => onPick(refinement.text)}
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
