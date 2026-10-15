"use client";

import type { ReactNode } from "react";
import type { Department, ShopperView } from "@/use-case";
import { ProductModal } from "./product-modal";
import { ShopProvider } from "./shop-context";
import styles from "./shop-shell.module.css";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

type ShopShellProps = {
  initialShopper: ShopperView | null;
  departments: readonly Department[];
  children: ReactNode;
};

export function ShopShell({ initialShopper, departments, children }: ShopShellProps) {
  return (
    <ShopProvider initialShopper={initialShopper}>
      <div className={styles.page}>
        <div className={styles.viewport}>
          <SiteHeader departments={departments} />
          {children}
        </div>
        <SiteFooter />
      </div>
      <ProductModal />
    </ShopProvider>
  );
}
