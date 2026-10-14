import { useEffect, useState } from "react";

export type Loaded<Value> = {
  isLoading: boolean;
  value: Value | null;
  replace: (value: Value) => void;
};

// The shopper's cart, orders, and list are read from the browser, so pages show them once
// the use case answers. `load` must be stable (useCallback) or it reloads on every render.
export function useLoaded<Value>(load: () => Promise<Value>): Loaded<Value> {
  const [state, setState] = useState<{ load: () => Promise<Value>; value: Value } | null>(null);

  useEffect(() => {
    let isCurrent = true;
    load().then((value) => {
      if (isCurrent) setState({ load, value });
    }, reportError);
    return () => {
      isCurrent = false;
    };
  }, [load]);

  const isFresh = state !== null && state.load === load;
  return {
    isLoading: !isFresh,
    value: isFresh ? state.value : null,
    replace: (value) => setState({ load, value }),
  };
}
