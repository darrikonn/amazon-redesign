"use client";

import Link from "next/link";
import { useCallback } from "react";
import type { ProductListing } from "@/use-case";
import { useContainer } from "./container-context";
import { EmptyState } from "./empty-state";
import { ProductShelf } from "./product-shelf";
import { useSavedList } from "./saved-list-context";
import page from "./shop-page.module.css";
import { useLoaded } from "./use-loaded";

export function SavedListView() {
  const container = useContainer();
  const { savedProductIds, toggleSaved } = useSavedList();
  const load = useCallback(() => container.viewSavedList.execute(), [container]);
  const list = useLoaded(load);
  // This page can only unsave what it shows (here or in the product modal), so the shown
  // list follows the shell's saved products without loading again.
  const listings = (list.value?.listings ?? []).filter((listing) =>
    savedProductIds.includes(listing.id),
  );

  return (
    <main className={page.main}>
      <div>
        <h1 className={page.title}>Your list</h1>
        <p className={page.lede}>Products you saved for later.</p>
      </div>
      {list.isLoading && <p className={page.loading}>Loading your list</p>}
      {list.value !== null && listings.length === 0 && (
        <EmptyState
          icon="heart"
          title="Your list is empty"
          message="Open any product and tap its heart to save it here."
        >
          <Link href="/" className={page.primaryButton}>
            Find something
          </Link>
        </EmptyState>
      )}
      {listings.length > 0 && (
        <ProductShelf
          label="Your list"
          listings={listings}
          renderAction={(listing: ProductListing) => (
            <button
              type="button"
              className={page.cardAction}
              aria-label={`Remove ${listing.name} from your list`}
              onClick={() => {
                toggleSaved(listing.id).catch(reportError);
              }}
            >
              Remove from list
            </button>
          )}
        />
      )}
    </main>
  );
}
