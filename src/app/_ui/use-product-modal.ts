import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductId } from "@/core";
import { productIdIn, withProduct } from "./search-url";

export type ProductModalState = {
  productId: ProductId | null;
  open: (productId: ProductId) => void;
  close: () => void;
};

// The open product lives in the address, so Back closes the modal, Forward reopens it,
// and a shared link opens it straight away (ADR 0029). Which search the address shows is
// kept in step with the screen by the storefront, not here.
export function useProductModal(initialProductId: ProductId | null): ProductModalState {
  const [productId, setProductId] = useState(initialProductId);
  // history.back() lands later, so a second close before it lands must not step back again.
  const isGoingBackRef = useRef(false);

  useEffect(() => {
    function followHistory() {
      isGoingBackRef.current = false;
      setProductId(productIdIn(window.location.href));
    }
    window.addEventListener("popstate", followHistory);
    return () => window.removeEventListener("popstate", followHistory);
  }, []);

  const open = useCallback((nextProductId: ProductId) => {
    const state = { ...window.history.state, [OPENED_PRODUCT]: true };
    window.history.pushState(state, "", withProduct(window.location.href, nextProductId));
    setProductId(nextProductId);
  }, []);

  const close = useCallback(() => {
    if (isGoingBackRef.current) return;
    if (window.history.state?.[OPENED_PRODUCT] === true) {
      isGoingBackRef.current = true;
      window.history.back();
      return;
    }
    setProductId(null);
  }, []);

  return { productId, open, close };
}

// Marks a history entry that opening a product pushed, so closing steps back to the entry
// before it instead of piling up entries. It sits in history.state beside the framework's
// own keys, so it survives a reload.
const OPENED_PRODUCT = "openedProduct";
