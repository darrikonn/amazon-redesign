import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductId } from "@/core";
import { isProductEntry, pushProductEntry, replaceAddress } from "./address-history";
import { PRODUCT_PARAMETER, productIdIn, withProduct } from "./search-url";

export type ProductModalState = {
  productId: ProductId | null;
  open: (productId: ProductId) => void;
  close: () => void;
};

// The open product lives in the address, so Back closes the modal, Forward reopens it,
// and a shared link opens it straight away (ADR 0029). Which search the address shows is
// kept in step with the screen by the storefront, not here.
export function useProductModal(): ProductModalState {
  const pathname = usePathname();
  const productInAddress = useSearchParams().get(PRODUCT_PARAMETER);
  const [productId, setProductId] = useState(productInAddress);
  // Moving to another page (signing in to save, say) takes the product the new address
  // names, so the modal never stays open over a page it does not belong to.
  const [shownPathname, setShownPathname] = useState(pathname);
  if (pathname !== shownPathname) {
    setShownPathname(pathname);
    setProductId(productInAddress);
  }
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
    pushProductEntry(withProduct(window.location.href, nextProductId));
    setProductId(nextProductId);
  }, []);

  const close = useCallback(() => {
    if (isGoingBackRef.current) return;
    if (isProductEntry()) {
      isGoingBackRef.current = true;
      window.history.back();
      return;
    }
    replaceAddress(withProduct(window.location.href, null));
    setProductId(null);
  }, []);

  return { productId, open, close };
}
