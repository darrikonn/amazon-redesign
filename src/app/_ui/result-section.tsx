import type { ProductId, SearchSort } from "@/core";
import type { SearchOutcome, SortOptionView } from "@/use-case";
import { BrowseNavigation } from "./browse-navigation";
import { resultCountLabel } from "./format";
import { ProductCard } from "./product-card";
import styles from "./result-section.module.css";

type ResultSectionProps = {
  outcome: SearchOutcome;
  cartProductIds: readonly ProductId[];
  onSearch: (text: string) => void;
  onPickSort: (sort: SearchSort, text: string) => void;
  onToggleCart: (productId: ProductId) => void;
};

export function ResultSection({
  outcome,
  cartProductIds,
  onSearch,
  onPickSort,
  onToggleCart,
}: ResultSectionProps) {
  return (
    <section
      aria-label="Results"
      className={outcome.navigation === null ? styles.results : styles.resultsWithNavigation}
    >
      {outcome.navigation !== null && (
        <div className={styles.sidebar}>
          <BrowseNavigation navigation={outcome.navigation} onSearch={onSearch} />
        </div>
      )}
      <div className={styles.main}>
        <div className={styles.heading}>
          <h2 className={styles.headline} aria-live="polite">
            {outcome.headline}
          </h2>
          {outcome.resultCount > 0 && (
            <SortControl options={outcome.sortOptions} onPick={onPickSort} />
          )}
        </div>
        {outcome.emptyMessage !== null && <EmptyState outcome={outcome} onSearch={onSearch} />}
        {outcome.closestMatchesHeading !== null && (
          <h3 className={styles.closestHeading}>{outcome.closestMatchesHeading}</h3>
        )}
        {outcome.listings.length > 0 && (
          <ul className={styles.grid}>
            {outcome.listings.map((listing) => (
              <li key={listing.id} className={styles.gridItem}>
                <ProductCard
                  listing={listing}
                  isInCart={cartProductIds.includes(listing.id)}
                  onToggleCart={onToggleCart}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
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
