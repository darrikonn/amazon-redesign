export type FocusRecovery = {
  // Whether the choice has now been searched, so it no longer needs watching.
  isSettled: boolean;
  target: "results-headline" | "search-input" | null;
};

type FocusSituation = {
  chosenText: string | null;
  searchedText: string;
  text: string;
  isFocusLost: boolean;
  isShowingResults: boolean;
};

// Choosing something can fold away the very control that was used (a starter query, the
// last chip, the example arrow), which would leave keyboard focus nowhere. Once the choice
// has been searched, focus moves to the results headline, or back to the input on the way
// home; if the shopper has typed something else since, or focus is somewhere real, it is
// theirs and is left alone.
export function recoverFocus(situation: FocusSituation): FocusRecovery {
  const { chosenText, searchedText, text, isFocusLost, isShowingResults } = situation;
  if (chosenText === null || searchedText !== chosenText) return { isSettled: false, target: null };
  if (text !== chosenText || !isFocusLost) return { isSettled: true, target: null };
  return { isSettled: true, target: isShowingResults ? "results-headline" : "search-input" };
}
