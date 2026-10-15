"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Container } from "@/composition";
import type { ProductId } from "@/core";
import type { ToggleSavedItemResult } from "@/use-case";
import { useContainer } from "./container-context";

export type SavedList = {
  savedProductIds: readonly ProductId[];
  toggleSaved: (productId: ProductId) => Promise<ToggleSavedItemResult>;
  reloadSavedList: () => Promise<void>;
};

const SavedListContext = createContext<SavedList | null>(null);

// The list lives in the browser, so it loads after the first render (ADR 0030).
export function SavedListProvider({ children }: { children: ReactNode }) {
  const container = useContainer();
  const [savedProductIds, setSavedProductIds] = useState<readonly ProductId[]>([]);

  const reloadSavedList = useCallback(async () => {
    setSavedProductIds(await loadSavedProductIds(container));
  }, [container]);

  useEffect(() => {
    let isCurrent = true;
    loadSavedProductIds(container).then((loaded) => {
      if (isCurrent) setSavedProductIds(loaded);
    }, reportError);
    return () => {
      isCurrent = false;
    };
  }, [container]);

  const toggleSaved = useCallback(
    async (productId: ProductId) => {
      const result = await container.toggleSavedItem.execute({ productId });
      if (result.status !== "signed-out") setSavedProductIds(result.list.productIds);
      return result;
    },
    [container],
  );

  const value = useMemo<SavedList>(
    () => ({ savedProductIds, toggleSaved, reloadSavedList }),
    [savedProductIds, toggleSaved, reloadSavedList],
  );
  return <SavedListContext value={value}>{children}</SavedListContext>;
}

export function useSavedList(): SavedList {
  const savedList = useContext(SavedListContext);
  if (savedList === null) throw new Error("useSavedList is used outside the ShopProvider");
  return savedList;
}

async function loadSavedProductIds(container: Container): Promise<readonly ProductId[]> {
  const list = await container.viewSavedList.execute();
  return list?.productIds ?? [];
}
