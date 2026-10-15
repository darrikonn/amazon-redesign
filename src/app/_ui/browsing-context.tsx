"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ProductPreview } from "./product-preview";
import { DEFAULT_SORT, searchUrl } from "./search-url";
import { type ProductModalState, useProductModal } from "./use-product-modal";

type SearchHandler = (text: string) => void;

export type Browsing = {
  productModal: ProductModalState;
  productPreview: ProductPreview | null;
  openProduct: (preview: ProductPreview) => void;
  search: (text: string) => void;
  inPlaceSearchRef: RefObject<SearchHandler | null>;
};

const BrowsingContext = createContext<Browsing | null>(null);

// The open product, and where a search from the header goes, outlive the page they started
// on, so they sit above the pages.
export function BrowsingProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const productModal = useProductModal();
  const [productPreview, setProductPreview] = useState<ProductPreview | null>(null);
  const inPlaceSearchRef = useRef<SearchHandler | null>(null);

  const { open: openProductModal } = productModal;
  const openProduct = useCallback(
    (preview: ProductPreview) => {
      setProductPreview(preview);
      openProductModal(preview.id);
    },
    [openProductModal],
  );

  // On the home page the search runs in place; elsewhere it goes to the home page.
  const search = useCallback(
    (text: string) => {
      const handler = inPlaceSearchRef.current;
      if (handler === null) router.push(searchUrl({ text, sort: DEFAULT_SORT }));
      else handler(text);
    },
    [router],
  );

  const value = useMemo<Browsing>(
    () => ({ productModal, productPreview, openProduct, search, inPlaceSearchRef }),
    [productModal, productPreview, openProduct, search],
  );
  return <BrowsingContext value={value}>{children}</BrowsingContext>;
}

export function useBrowsing(): Browsing {
  const browsing = useContext(BrowsingContext);
  if (browsing === null) throw new Error("useBrowsing is used outside the ShopProvider");
  return browsing;
}

// While the page that calls it is open, searches from the header run through `handler`.
export function useInPlaceSearch(handler: SearchHandler) {
  const { inPlaceSearchRef } = useBrowsing();
  useEffect(() => {
    inPlaceSearchRef.current = handler;
    return () => {
      inPlaceSearchRef.current = null;
    };
  }, [inPlaceSearchRef, handler]);
}
