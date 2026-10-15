import { useCallback, useState } from "react";
import { useLatestLoad } from "./use-latest-load";

export type Loaded<Value> = {
  isLoading: boolean;
  value: Value | null;
  replace: (value: Value) => void;
};

// The shopper's cart, orders, and list are read from the browser, so pages show them once
// the use case answers. `load` must be stable (useCallback) or it reloads on every render.
export function useLoaded<Value>(load: () => Promise<Value>): Loaded<Value> {
  const [state, setState] = useState<{ load: () => Promise<Value>; value: Value } | null>(null);

  const keep = useCallback((value: Value) => setState({ load, value }), [load]);
  useLatestLoad(load, keep);

  const isFresh = state !== null && state.load === load;
  return {
    isLoading: !isFresh,
    value: isFresh ? state.value : null,
    replace: (value) => setState({ load, value }),
  };
}
