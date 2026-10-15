import { useCallback, useState } from "react";
import type { Container } from "@/composition";
import type { SearchSort } from "@/core";
import type { SearchOutcome } from "@/use-case";
import { useLatestLoad } from "./use-latest-load";

type SearchOutcomes = {
  outcome: SearchOutcome;
  lastResults: SearchOutcome | null;
};

// lastResults keeps the latest search that had text, so the results can fold away on the
// way home instead of vanishing.
export function useSearchOutcome(
  container: Container,
  initial: SearchOutcome,
  text: string,
  sort: SearchSort,
): SearchOutcomes {
  const [outcome, setOutcome] = useState(initial);
  const [lastResults, setLastResults] = useState(initial.hasQuery ? initial : null);
  const search = useCallback(
    () => container.searchCatalog.execute({ text, sort }),
    [container, text, sort],
  );
  const show = useCallback((next: SearchOutcome) => {
    setOutcome(next);
    if (next.hasQuery) setLastResults(next);
  }, []);
  // Only the newest search may update the screen, so a slow early one never wins.
  useLatestLoad(search, show);

  return { outcome, lastResults };
}
