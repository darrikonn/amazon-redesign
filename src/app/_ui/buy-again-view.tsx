"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useContainer } from "./container-context";
import { ProductShelf } from "./product-shelf";
import page from "./shop-page.module.css";
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
        <div className={`${page.panel} ${page.empty}`}>
          <p className={page.emptyTitle}>Nothing to buy again yet</p>
          <p className={page.muted}>Products from your delivered orders show up here.</p>
          <Link href="/deals" className={page.primaryButton}>
            See today’s deals
          </Link>
        </div>
      )}
      {shelf.value !== null && shelf.value.listings.length > 0 && (
        <ProductShelf label="Buy again" listings={shelf.value.listings} />
      )}
    </main>
  );
}
