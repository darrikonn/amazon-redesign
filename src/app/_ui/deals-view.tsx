"use client";

import { useCallback } from "react";
import { useContainer } from "./container-context";
import { formatDayAndDate } from "./format";
import { PageHeading } from "./page-heading";
import { ProductShelf } from "./product-shelf";
import page from "./shop-page.module.css";
import { SHOP_PLACES } from "./shop-place";
import { useLoaded } from "./use-loaded";

export function DealsView() {
  const container = useContainer();
  const load = useCallback(() => container.viewDeals.execute(), [container]);
  const deals = useLoaded(load);
  return (
    <main className={page.main}>
      <PageHeading
        place={SHOP_PLACES.deals}
        lede={
          deals.value === null
            ? "A new set of deals every day."
            : `${formatDayAndDate(`${deals.value.day}T12:00:00Z`)}: a new set of deals every day.`
        }
      />
      {deals.isLoading && <p className={page.loading}>Finding today’s deals</p>}
      {deals.value !== null && (
        <ProductShelf label="Discounted today" listings={deals.value.listings} />
      )}
    </main>
  );
}
