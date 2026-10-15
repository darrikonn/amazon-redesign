"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useContainer } from "./container-context";
import { EmptyState } from "./empty-state";
import { ProductShelf } from "./product-shelf";
import page from "./shop-page.module.css";
import { SHOP_PLACES } from "./shop-place";
import { useLoaded } from "./use-loaded";

export function BuyAgainView() {
  const container = useContainer();
  const load = useCallback(() => container.viewBuyAgain.execute(), [container]);
  const shelf = useLoaded(load);
  return (
    <main className={page.main}>
      <div>
        <h1 className={page.title}>Buy again</h1>
        <p className={page.lede}>What you have bought before and kept, most bought first.</p>
      </div>
      {shelf.isLoading && <p className={page.loading}>Loading your regular items</p>}
      {shelf.value !== null && shelf.value.listings.length === 0 && (
        <EmptyState
          icon="refresh"
          title="Nothing to buy again yet"
          message="Products from your delivered orders show up here."
        >
          <Link href={SHOP_PLACES.deals.href} className={page.primaryButton}>
            See today’s deals
          </Link>
        </EmptyState>
      )}
      {shelf.value !== null && shelf.value.listings.length > 0 && (
        <ProductShelf label="Bought before" listings={shelf.value.listings} />
      )}
    </main>
  );
}
