import { useCallback, useEffect, useState } from "react";
import { SearchTextScheduler } from "./search-text-scheduler";
import { BROWSER_TIMER } from "./timer";

export type SearchText = {
  text: string;
  searchText: string;
  isPending: boolean;
  type: (next: string) => void;
  apply: (next: string) => void;
};

export function useSearchText(initial: string): SearchText {
  const [text, setText] = useState(initial);
  const [searchText, setSearchText] = useState(initial);
  const [scheduler] = useState(() => new SearchTextScheduler(BROWSER_TIMER, setSearchText));

  useEffect(() => () => scheduler.dispose(), [scheduler]);

  const type = useCallback(
    (next: string) => {
      setText(next);
      scheduler.type(next);
    },
    [scheduler],
  );

  const apply = useCallback(
    (next: string) => {
      setText(next);
      scheduler.apply(next);
    },
    [scheduler],
  );

  return { text, searchText, isPending: text !== searchText, type, apply };
}
