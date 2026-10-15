"use client";

import { useCallback } from "react";
import { useContainer } from "./container-context";
import { formatDayAndDate } from "./format";
import { ProductShelf } from "./product-shelf";
import page from "./shop-page.module.css";
import { useLoaded } from "./use-loaded";

export function DealsView() {
  const container = useContainer();
  const load = useCallback(() => container.viewDeals.execute(), [container]);
  const deals = useLoaded(load);
  return (
    <main className={page.main}>
      <div>
        <h1 className={page.title}>Today’s deals</h1>
        <p className={page.lede}>
          {deals.value === null
            ? "A new set of deals every day."
            : `${formatDayAndDate(`${deals.value.day}T12:00:00Z`)}: a new set of deals every day.`}
        </p>
      </div>
      {deals.isLoading && <p className={page.loading}>Finding today’s deals</p>}
      {deals.value !== null && (
        <ProductShelf label="Today’s deals" listings={deals.value.listings} />
      )}
    </main>
  );
}
