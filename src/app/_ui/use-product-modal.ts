import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { ProductId } from "@/core";
import { BROWSER_HISTORY } from "./address-history";
import { ProductModalHistory } from "./product-modal-history";
import { PRODUCT_PARAMETER } from "./search-url";

export type ProductModalState = {
  productId: ProductId | null;
  open: (productId: ProductId) => void;
  close: () => void;
};

// The rules are ProductModalHistory's; this keeps React's state in step with them. Which
// search the address shows is kept in step with the screen by the storefront, not here.
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
  const [history] = useState(() => new ProductModalHistory(BROWSER_HISTORY));

  useEffect(() => {
    function followHistory() {
      setProductId(history.followHistory());
    }
    window.addEventListener("popstate", followHistory);
    return () => window.removeEventListener("popstate", followHistory);
  }, [history]);

  const open = useCallback(
    (nextProductId: ProductId) => {
      history.open(nextProductId);
      setProductId(nextProductId);
    },
    [history],
  );

  const close = useCallback(() => {
    if (history.close() === "closed") setProductId(null);
  }, [history]);

  return { productId, open, close };
}
