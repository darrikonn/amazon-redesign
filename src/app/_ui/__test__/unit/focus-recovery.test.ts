import { describe, expect, it } from "vitest";
import { recoverFocus } from "@/app/_ui/focus-recovery";

const chosen = {
  chosenText: "watches",
  searchedText: "watches",
  text: "watches",
  isFocusLost: true,
  isShowingResults: true,
};

describe("recoverFocus", () => {
  it("waits until the choice has been searched", () => {
    expect(recoverFocus({ ...chosen, searchedText: "" })).toEqual({
      isSettled: false,
      target: null,
    });
    expect(recoverFocus({ ...chosen, chosenText: null })).toEqual({
      isSettled: false,
      target: null,
    });
  });

  it("moves lost focus to the results headline, or to the input on the way home", () => {
    expect(recoverFocus(chosen)).toEqual({ isSettled: true, target: "results-headline" });
    expect(recoverFocus({ ...chosen, isShowingResults: false })).toEqual({
      isSettled: true,
      target: "search-input",
    });
  });

  it("leaves focus alone once the shopper typed something else, or focus is somewhere real", () => {
    expect(recoverFocus({ ...chosen, text: "watches under $100" })).toEqual({
      isSettled: true,
      target: null,
    });
    expect(recoverFocus({ ...chosen, isFocusLost: false })).toEqual({
      isSettled: true,
      target: null,
    });
  });
});
