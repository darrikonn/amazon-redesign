import { useCallback, useEffect, useRef, useState } from "react";

export type SearchText = {
  text: string;
  searchText: string;
  type: (next: string) => void;
  apply: (next: string) => void;
};

// What the shopper types shows at once, but the search waits for a short pause so it
// does not rerun on every keystroke. Picking a chip or a suggestion applies at once.
export function useSearchText(initial: string): SearchText {
  const [text, setText] = useState(initial);
  const [searchText, setSearchText] = useState(initial);
  const timer = useRef<number | null>(null);

  const cancelPending = useCallback(() => {
    if (timer.current === null) return;
    window.clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const type = useCallback(
    (next: string) => {
      setText(next);
      cancelPending();
      timer.current = window.setTimeout(() => {
        timer.current = null;
        setSearchText(next);
      }, SEARCH_PAUSE_IN_MILLISECONDS);
    },
    [cancelPending],
  );

  const apply = useCallback(
    (next: string) => {
      cancelPending();
      setText(next);
      setSearchText(next);
    },
    [cancelPending],
  );

  useEffect(() => cancelPending, [cancelPending]);

  return { text, searchText, type, apply };
}

const SEARCH_PAUSE_IN_MILLISECONDS = 250;
