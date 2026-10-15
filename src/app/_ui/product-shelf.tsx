"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useId } from "react";
import type { ProductListing } from "@/use-case";
import { useBrowsing } from "./browsing-context";
import { useCart } from "./cart-context";
import { ProductCard } from "./product-card";
import { withProduct } from "./search-url";
import page from "./shop-page.module.css";

type ProductShelfProps = {
  label: string;
  listings: readonly ProductListing[];
  renderAction?: (listing: ProductListing) => ReactNode;
};

export function ProductShelf({ label, listings, renderAction }: ProductShelfProps) {
  const { cart, toggleCart } = useCart();
  const { openProduct } = useBrowsing();
  const pathname = usePathname();
  const headingId = useId();
  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId} className="visually-hidden">
        {label}
      </h2>
      <ul className={page.grid}>
        {listings.map((listing) => (
          <li key={listing.id} className={page.gridItem}>
            <ProductCard
              listing={listing}
              href={withProduct(pathname, listing.id)}
              isInCart={cart.productIds.includes(listing.id)}
              onOpen={openProduct}
              onToggleCart={(productId) => {
                toggleCart(productId).catch(reportError);
              }}
            />
            {renderAction?.(listing)}
          </li>
        ))}
      </ul>
    </section>
  );
}
