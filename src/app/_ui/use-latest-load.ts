import { useEffect } from "react";

// Runs `load` whenever it changes and hands its answer to `apply`, unless a newer load has
// started since, so a slow early answer never overwrites a newer one. Both must be stable
// (useCallback); a null `load` loads nothing.
export function useLatestLoad<Value>(
  load: (() => Promise<Value>) | null,
  apply: (value: Value) => void,
) {
  useEffect(() => {
    if (load === null) return;
    let isCurrent = true;
    load().then((value) => {
      if (isCurrent) apply(value);
    }, reportError);
    return () => {
      isCurrent = false;
    };
  }, [load, apply]);
}
