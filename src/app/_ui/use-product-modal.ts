import { useCallback, useEffect, useState } from "react";
import type { ProductId } from "@/core";
import { productIdIn, withProduct } from "./search-url";

export type ProductModalState = {
  productId: ProductId | null;
  open: (productId: ProductId) => void;
  close: () => void;
};

// Marks the history entry that opening a product pushed, so closing can go back to the
// entry before it instead of piling up entries.
const OPENED_PRODUCT = "opened-product";

// The open product lives in the address, so Back closes the modal, Forward reopens it,
// and a shared link opens it straight away (ADR 0029).
export function useProductModal(initialProductId: ProductId | null): ProductModalState {
  const [productId, setProductId] = useState(initialProductId);

  useEffect(() => {
    function followHistory() {
      setProductId(productIdIn(window.location.href));
    }
    window.addEventListener("popstate", followHistory);
    return () => window.removeEventListener("popstate", followHistory);
  }, []);

  const open = useCallback((nextProductId: ProductId) => {
    window.history.pushState(OPENED_PRODUCT, "", withProduct(window.location.href, nextProductId));
    setProductId(nextProductId);
  }, []);

  const close = useCallback(() => {
    if (window.history.state === OPENED_PRODUCT) {
      window.history.back();
      return;
    }
    window.history.replaceState(null, "", withProduct(window.location.href, null));
    setProductId(null);
  }, []);

  return { productId, open, close };
}
