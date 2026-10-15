import { useEffect } from "react";

// While `title` is set, the tab says it; afterwards it says what it said before, unless the
// framework has named a new page in the meantime, whose title is then left alone.
export function useDocumentTitle(title: string | null) {
  useEffect(() => {
    if (title === null) return;
    const previous = document.title;
    document.title = title;
    return () => {
      if (document.title === title) document.title = previous;
    };
  }, [title]);
}
