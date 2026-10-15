import { useEffect } from "react";

// While `title` is set, the tab says it; afterwards it says what it said before.
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title === null) return;
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
