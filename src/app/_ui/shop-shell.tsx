"use client";

import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import type { Department, ShopperView } from "@/use-case";
import { ProductModal } from "./product-modal";
import { ShopProvider, useShop } from "./shop-context";
import styles from "./shop-shell.module.css";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type ShopShellProps = {
  initialShopper: ShopperView | null;
  departments: readonly Department[];
  children: ReactNode;
};

export function ShopShell({ initialShopper, departments, children }: ShopShellProps) {
  const initialProductId = useSearchParams().get("product");
  return (
    <ShopProvider initialShopper={initialShopper} initialProductId={initialProductId}>
      <div className={styles.page}>
        <div className={styles.viewport}>
          <SiteHeader departments={departments} />
          {children}
        </div>
        <SiteFooter />
      </div>
      <OpenProduct />
    </ShopProvider>
  );
}

function OpenProduct() {
  const shop = useShop();
  return (
    <ProductModal
      productId={shop.productModal.productId}
      preview={shop.productPreview}
      viewProduct={shop.container.viewProduct}
      cartProductIds={shop.cart.productIds}
      savedProductIds={shop.savedProductIds}
      isSignedIn={shop.shopper !== null}
      onToggleCart={(productId) => {
        shop.toggleCart(productId).catch(reportError);
      }}
      onToggleSaved={(productId) => {
        shop.toggleSaved(productId).catch(reportError);
      }}
      onClose={shop.productModal.close}
    />
  );
}
