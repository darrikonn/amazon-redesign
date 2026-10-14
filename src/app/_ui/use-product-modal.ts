import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductId } from "@/core";
import { productIdIn, withProduct } from "./search-url";

export type ProductModalState = {
  productId: ProductId | null;
  open: (productId: ProductId) => void;
  close: () => void;
};

// The open product lives in the address, so Back closes the modal, Forward reopens it,
// and a shared link opens it straight away (ADR 0029).
export function useProductModal(initialProductId: ProductId | null): ProductModalState {
  const [productId, setProductId] = useState(initialProductId);
  // Whether the current history entry is one that opening a product pushed, so closing
  // can step back to the entry before it instead of piling up entries. It is tracked here
  // because the framework keeps its own data in `history.state`.
  const isOnPushedEntryRef = useRef(false);
  // The search may have changed while the product was open (a pending search can land),
  // so the address that Back returns to is brought up to date with the screen.
  const addressAfterBackRef = useRef<string | null>(null);

  useEffect(() => {
    function followHistory() {
      const address = addressAfterBackRef.current;
      addressAfterBackRef.current = null;
      if (address !== null) window.history.replaceState(window.history.state, "", address);
      const shownProductId = productIdIn(window.location.href);
      isOnPushedEntryRef.current = shownProductId !== null;
      setProductId(shownProductId);
    }
    window.addEventListener("popstate", followHistory);
    return () => window.removeEventListener("popstate", followHistory);
  }, []);

  const open = useCallback((nextProductId: ProductId) => {
    const address = withProduct(window.location.href, nextProductId);
    window.history.pushState(window.history.state, "", address);
    isOnPushedEntryRef.current = true;
    setProductId(nextProductId);
  }, []);

  const close = useCallback(() => {
    const addressWithoutProduct = withProduct(window.location.href, null);
    if (isOnPushedEntryRef.current) {
      addressAfterBackRef.current = addressWithoutProduct;
      window.history.back();
      return;
    }
    window.history.replaceState(window.history.state, "", addressWithoutProduct);
    setProductId(null);
  }, []);

  return { productId, open, close };
}
