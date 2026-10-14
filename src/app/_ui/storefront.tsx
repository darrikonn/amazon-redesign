"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import { type Container, createContainer } from "@/composition";
import type { ProductId, SearchSort } from "@/core";
import type { CartSummary, SearchOutcome, Storefront as StorefrontData } from "@/use-case";
import { Collapsible } from "./collapsible";
import { RESULTS_HEADLINE_ID, ResultSection } from "./result-section";
import { SearchPanel } from "./search-panel";
import { searchUrl } from "./search-url";
import { ShortcutList } from "./shortcut-list";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { StarterQueryList } from "./starter-query-list";
import styles from "./storefront.module.css";
import { useIdle } from "./use-idle";
import { useSearchText } from "./use-search-text";
import { useTypingDemo } from "./use-typing-demo";

type StorefrontProps = {
  initialOutcome: SearchOutcome;
  storefront: StorefrontData;
};

export function Storefront({ initialOutcome, storefront }: StorefrontProps) {
  const [container] = useState(createContainer);
  const search = useSearchText(initialOutcome.text);
  const [sort, setSort] = useState(initialOutcome.requestedSort);
  const { outcome, lastResults } = useSearchOutcome(
    container,
    initialOutcome,
    search.searchText,
    sort,
  );
  const [cart, setCart] = useState<CartSummary>(EMPTY_CART);
  const isIdle = useIdle(DEMO_IDLE_DELAY_IN_MILLISECONDS);
  const demo = useTypingDemo(storefront.starterQueries, search.text === "" && isIdle);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // The layout follows the search that ran, not each keystroke, so it changes once, after
  // the pause, and the hero folds away instead of vanishing under the caret.
  const isShowingResults = outcome.hasQuery;
  // Chips, suggestions, sort options, relaxations, and narrowing browse links belong to the
  // last search. Until the newer typed text has been searched they would throw that text
  // away, so picking one then searches the typed text instead.
  const isUpdating = search.text !== outcome.text;

  useEffect(() => {
    container.viewCart.execute().then(setCart, reportError);
  }, [container]);

  const { apply, text } = search;

  const chosenTextRef = useRef<string | null>(null);
  const choose = useCallback(
    (nextText: string) => {
      chosenTextRef.current = nextText;
      apply(nextText);
    },
    [apply],
  );

  const pick = useCallback(
    (nextText: string) => choose(isUpdating ? text : nextText),
    [choose, isUpdating, text],
  );

  useFocusRecovery(chosenTextRef, isShowingResults, outcome, inputRef);

  const pickSort = useCallback(
    (nextSort: SearchSort, nextText: string) => {
      setSort(nextSort);
      pick(nextText);
    },
    [pick],
  );

  const toggleCart = useCallback(
    (productId: ProductId) => {
      container.toggleCartItem.execute({ productId }).then(setCart, reportError);
    },
    [container],
  );

  return (
    <div className={styles.page}>
      <div className={styles.viewport}>
        <SiteHeader
          shopper={storefront.shopper}
          departments={storefront.departments}
          cartCount={cart.itemCount}
          onSearch={choose}
        />
        <main className={isShowingResults ? styles.mainWithResults : styles.mainEmpty}>
          <Collapsible isOpen={!isShowingResults}>
            <Hero />
          </Collapsible>
          <SearchPanel
            inputRef={inputRef}
            text={text}
            results={lastResults}
            isShowingResults={isShowingResults}
            isUpdating={isUpdating}
            placeholder={demo.placeholder}
            onType={search.type}
            onApply={apply}
            onPick={pick}
            onTryExample={() => choose(demo.example)}
          />
          <Collapsible isOpen={!isShowingResults}>
            <div className={styles.home}>
              <StarterQueryList queries={storefront.starterQueries} onPick={choose} />
              <ShortcutList />
            </div>
          </Collapsible>
          <Collapsible isOpen={isShowingResults}>
            {lastResults !== null && (
              <ResultSection
                outcome={lastResults}
                isUpdating={isUpdating}
                cartProductIds={cart.productIds}
                onSearch={pick}
                onBrowse={choose}
                onPickSort={pickSort}
                onToggleCart={toggleCart}
              />
            )}
          </Collapsible>
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

type SearchOutcomes = {
  outcome: SearchOutcome;
  lastResults: SearchOutcome | null;
};

// lastResults keeps the latest search that had text, so the results can fold away on the
// way home instead of vanishing.
function useSearchOutcome(
  container: Container,
  initial: SearchOutcome,
  text: string,
  sort: SearchSort,
): SearchOutcomes {
  const [outcome, setOutcome] = useState(initial);
  const [lastResults, setLastResults] = useState(initial.hasQuery ? initial : null);
  const latestRequest = useRef(0);

  useEffect(() => {
    latestRequest.current += 1;
    const request = latestRequest.current;
    window.history.replaceState(null, "", searchUrl({ text, sort }));
    container.searchCatalog.execute({ text, sort }).then((next) => {
      // Only the newest search may update the screen, so a slow early one never wins.
      if (request !== latestRequest.current) return;
      setOutcome(next);
      if (next.hasQuery) setLastResults(next);
    }, reportError);
  }, [container, text, sort]);

  return { outcome, lastResults };
}

// Choosing something can fold away the very control that was used (a starter query, the
// last chip, the example arrow), which would leave keyboard focus nowhere. Focus then moves
// to the results headline, or back to the input on the way home.
function useFocusRecovery(
  chosenTextRef: RefObject<string | null>,
  isShowingResults: boolean,
  outcome: SearchOutcome,
  inputRef: RefObject<HTMLTextAreaElement | null>,
) {
  useEffect(() => {
    if (chosenTextRef.current === null || outcome.text !== chosenTextRef.current) return;
    chosenTextRef.current = null;
    const active = document.activeElement;
    if (active !== null && active !== document.body && active.closest("[inert]") === null) return;
    const target = isShowingResults
      ? document.getElementById(RESULTS_HEADLINE_ID)
      : inputRef.current;
    target?.focus({ preventScroll: true });
  }, [chosenTextRef, isShowingResults, outcome.text, inputRef]);
}

const EMPTY_CART: CartSummary = { productIds: [], itemCount: 0 };

const DEMO_IDLE_DELAY_IN_MILLISECONDS = 4000;

function Hero() {
  return (
    <div className={styles.hero}>
      <h1 className={styles.title}>
        Just say what you <span className={styles.accent}>need.</span>
      </h1>
      <p className={styles.lede}>
        Describe it like you would to a shop assistant. The filters set themselves while you type.
      </p>
    </div>
  );
}
