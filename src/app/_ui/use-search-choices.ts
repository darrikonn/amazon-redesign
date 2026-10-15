import { type RefObject, useCallback, useEffect, useRef } from "react";
import type { SearchSort } from "@/core";
import { recoverFocus } from "./focus-recovery";
import { RESULTS_HEADLINE_ID } from "./result-section";

type SearchChoicesInputs = {
  text: string;
  searchedText: string;
  isShowingResults: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  apply: (text: string) => void;
  setSort: (sort: SearchSort) => void;
};

export type SearchChoices = {
  // The typed text is newer than the search on screen.
  isUpdating: boolean;
  // Picking a chip now would throw typed text away, so it searches the typed text instead.
  keepsTypedText: boolean;
  choose: (text: string) => void;
  pick: (text: string) => void;
  pickSort: (sort: SearchSort, text: string) => void;
};

// Chips, suggestions, sort options, and relaxations belong to the last search. Until the
// newer typed text has been searched they would throw that text away, so picking one then
// searches the typed text instead. A bar the shopper emptied has nothing to lose.
export function useSearchChoices(inputs: SearchChoicesInputs): SearchChoices {
  const { text, searchedText, isShowingResults, inputRef, apply, setSort } = inputs;
  const isUpdating = text !== searchedText;
  const keepsTypedText = isUpdating && text.trim() !== "";

  // Set only when the choice changes the bar or the search; a choice that changes neither
  // would never be cleared, and a later, unrelated search would move focus.
  const chosenTextRef = useRef<string | null>(null);
  const choose = useCallback(
    (nextText: string) => {
      const changesNothing = nextText === text && nextText === searchedText;
      chosenTextRef.current = changesNothing ? null : nextText;
      apply(nextText);
    },
    [apply, text, searchedText],
  );

  const pick = useCallback(
    (nextText: string) => choose(keepsTypedText ? text : nextText),
    [choose, keepsTypedText, text],
  );

  const pickSort = useCallback(
    (nextSort: SearchSort, nextText: string) => {
      setSort(nextSort);
      pick(nextText);
    },
    [setSort, pick],
  );

  useFocusRecovery({ chosenTextRef, isShowingResults, text, searchedText, inputRef });
  return { isUpdating, keepsTypedText, choose, pick, pickSort };
}

type FocusRecoveryInputs = {
  chosenTextRef: RefObject<string | null>;
  isShowingResults: boolean;
  text: string;
  searchedText: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};

// Watches the bar as well as the search, because choosing the text that was already
// searched (the example arrow on an emptied bar) changes only the bar (focus-recovery.ts).
function useFocusRecovery(inputs: FocusRecoveryInputs) {
  const { chosenTextRef, isShowingResults, text, searchedText, inputRef } = inputs;
  useEffect(() => {
    const recovery = recoverFocus({
      chosenText: chosenTextRef.current,
      searchedText,
      text,
      isFocusLost: isFocusLost(document.activeElement),
      isShowingResults,
    });
    if (recovery.isSettled) chosenTextRef.current = null;
    if (recovery.target === "results-headline") {
      document.getElementById(RESULTS_HEADLINE_ID)?.focus({ preventScroll: true });
    }
    if (recovery.target === "search-input") inputRef.current?.focus({ preventScroll: true });
  }, [chosenTextRef, isShowingResults, text, searchedText, inputRef]);
}

// Focus is lost when it fell back to the page itself or sits inside folded, inert content.
function isFocusLost(active: Element | null): boolean {
  return active === null || active === document.body || active.closest("[inert]") !== null;
}
