import { useRef } from "react";
import type { ProductId, SearchSort } from "@/core";
import type { SearchOutcome, SortOptionView } from "@/use-case";
import { BrowseNavigation } from "./browse-navigation";
import { useBrowsing } from "./browsing-context";
import { useCart } from "./cart-context";
import { resultCountLabel } from "./format";
import { scrollToTop } from "./motion";
import { ProductCard } from "./product-card";
import styles from "./result-section.module.css";
import { searchUrl } from "./search-url";

type ResultSectionProps = {
  outcome: SearchOutcome;
  isUpdating: boolean;
  onSearch: (text: string) => void;
  onBrowse: (text: string) => void;
  onPickSort: (sort: SearchSort, text: string) => void;
};

export const RESULTS_HEADLINE_ID = "results-headline";

const CLOSEST_HEADING_ID = "closest-matches-heading";

export function ResultSection({
  outcome,
  isUpdating,
  onSearch,
  onBrowse,
  onPickSort,
}: ResultSectionProps) {
  const { cart, toggleCart } = useCart();
  const { openProduct } = useBrowsing();
  const mainRef = useRef<HTMLDivElement>(null);

  function productHref(productId: ProductId): string {
    return searchUrl({ text: outcome.text, sort: outcome.requestedSort, productId });
  }

  function browse(text: string, anchor: HTMLElement) {
    onBrowse(text);
    if (shouldReturnToTop(mainRef.current, anchor)) scrollToTop();
  }

  const grid = (
    <ul className={styles.grid}>
      {outcome.listings.map((listing) => (
        <li key={listing.id} className={styles.gridItem}>
          <ProductCard
            listing={listing}
            href={productHref(listing.id)}
            isInCart={cart.productIds.includes(listing.id)}
            onOpen={openProduct}
            onToggleCart={(productId) => {
              toggleCart(productId).catch(reportError);
            }}
          />
        </li>
      ))}
    </ul>
  );

  return (
    <section
      aria-label="Results"
      className={styles.results}
      data-updating={isUpdating}
      aria-busy={isUpdating}
    >
      <div ref={mainRef} className={styles.main}>
        <div className={styles.heading}>
          <h2 id={RESULTS_HEADLINE_ID} className={styles.headline} aria-live="polite" tabIndex={-1}>
            {outcome.headline}
          </h2>
          {outcome.resultCount > 0 && (
            <SortControl options={outcome.sortOptions} onPick={onPickSort} />
          )}
        </div>
        {outcome.emptyMessage !== null && <EmptyState outcome={outcome} onSearch={onSearch} />}
        {/* Closest matches are not results: they sit apart, under their own heading, so
            nobody mistakes them for products that match everything asked for. */}
        {outcome.closestMatchesHeading !== null && outcome.listings.length > 0 && (
          <section className={styles.closest} aria-labelledby={CLOSEST_HEADING_ID}>
            <div className={styles.closestIntro}>
              <h3 id={CLOSEST_HEADING_ID} className={styles.closestHeading}>
                {outcome.closestMatchesHeading}
              </h3>
              <p className={styles.closestLede}>
                Nothing matches everything you asked for, so these leave some of it out.
              </p>
            </div>
            {grid}
          </section>
        )}
        {outcome.closestMatchesHeading === null && outcome.listings.length > 0 && grid}
      </div>
      {/* After the results in the DOM, so keyboard and screen reader order puts products
          first; on desktop the grid draws the panel in the left column. */}
      <div className={styles.sidebar}>
        <BrowseNavigation
          navigation={outcome.navigation}
          sort={outcome.requestedSort}
          productHref={productHref}
          onBrowse={browse}
        />
      </div>
    </section>
  );
}

// On a phone the panel follows the results, so the new results are above it and the page
// goes back to the top. Beside the results, it goes to the top only when the clicked entry
// stays in view there, so the entry never jumps away from the pointer.
function shouldReturnToTop(main: HTMLElement | null, anchor: HTMLElement): boolean {
  const anchorBox = anchor.getBoundingClientRect();
  const isBelowResults = main !== null && anchorBox.top > main.getBoundingClientRect().bottom;
  return isBelowResults || anchorBox.bottom + window.scrollY <= window.innerHeight;
}

function SortControl({
  options,
  onPick,
}: {
  options: readonly SortOptionView[];
  onPick: (sort: SearchSort, text: string) => void;
}) {
  return (
    <fieldset className={styles.sortControl}>
      <legend className="visually-hidden">Sort results</legend>
      {options.map((option) => (
        <button
          type="button"
          key={option.sort}
          className={option.isSelected ? styles.sortOptionSelected : styles.sortOption}
          aria-pressed={option.isSelected}
          onClick={() => onPick(option.sort, option.text)}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}

function EmptyState({
  outcome,
  onSearch,
}: {
  outcome: SearchOutcome;
  onSearch: (text: string) => void;
}) {
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyMessage}>{outcome.emptyMessage}</p>
      {outcome.relaxations.map((relaxation) => (
        <button
          type="button"
          key={relaxation.label}
          className={styles.relaxation}
          onClick={() => onSearch(relaxation.text)}
        >
          {relaxation.label} · {resultCountLabel(relaxation.resultCount)}
        </button>
      ))}
    </div>
  );
}
