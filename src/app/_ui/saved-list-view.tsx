"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import type { ProductId } from "@/core";
import type { ProductListing } from "@/use-case";
import { useAnnounce } from "./announcer-context";
import { useContainer } from "./container-context";
import { EmptyState } from "./empty-state";
import { focusAfterRemoval } from "./focus-after-removal";
import { ProductShelf } from "./product-shelf";
import { useSavedList } from "./saved-list-context";
import page from "./shop-page.module.css";
import { useLoaded } from "./use-loaded";

export function SavedListView() {
  const container = useContainer();
  const { savedProductIds, toggleSaved } = useSavedList();
  const announce = useAnnounce();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const load = useCallback(() => container.viewSavedList.execute(), [container]);
  const list = useLoaded(load);
  // This page can only unsave what it shows (here or in the product modal), so the shown
  // list follows the shell's saved products without loading again.
  const listings = (list.value?.listings ?? []).filter((listing) =>
    savedProductIds.includes(listing.id),
  );

  async function remove(listing: ProductListing) {
    const listedIds = listings.map((candidate) => candidate.id);
    await toggleSaved(listing.id);
    announce(`${listing.name} removed from your list`);
    focusAfterRemoval(listedIds, listing.id, removeButtonIdFor, titleRef.current);
  }

  return (
    <main className={page.main}>
      <div>
        <h1 ref={titleRef} className={page.title} tabIndex={-1}>
          Your list
        </h1>
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
          label="Saved products"
          listings={listings}
          renderAction={(listing: ProductListing) => (
            <button
              id={removeButtonIdFor(listing.id)}
              type="button"
              className={page.cardAction}
              aria-label={`Remove ${listing.name} from your list`}
              onClick={() => {
                remove(listing).catch(reportError);
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

function removeButtonIdFor(productId: ProductId): string {
  return `remove-${productId}`;
}
