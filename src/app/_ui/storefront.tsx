"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Container, createContainer } from "@/composition";
import type { ProductId, SearchSort } from "@/core";
import type { CartSummary, SearchOutcome, Storefront as StorefrontData } from "@/use-case";
import { Collapsible } from "./collapsible";
import { ResultSection } from "./result-section";
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
  const outcome = useSearchOutcome(container, initialOutcome, search.searchText, sort);
  const [cart, setCart] = useState<CartSummary>(EMPTY_CART);
  const isIdle = useIdle(DEMO_IDLE_DELAY_IN_MILLISECONDS);
  const demo = useTypingDemo(storefront.starterQueries, search.text === "" && isIdle);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // The layout follows the search that ran, not each keystroke, so it changes once, after
  // the pause, and the hero folds away instead of vanishing under the caret.
  const isShowingResults = outcome.hasQuery;

  useEffect(() => {
    container.viewCart.execute().then(setCart, reportError);
  }, [container]);

  const { apply } = search;

  const pickSort = useCallback(
    (nextSort: SearchSort, nextText: string) => {
      setSort(nextSort);
      apply(nextText);
    },
    [apply],
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
          onSearch={apply}
        />
        <main className={isShowingResults ? styles.mainWithResults : styles.mainEmpty}>
          <Collapsible isOpen={!isShowingResults}>
            <Hero />
          </Collapsible>
          <SearchPanel
            inputRef={inputRef}
            text={search.text}
            outcome={outcome}
            placeholder={demo.placeholder}
            onType={search.type}
            onApply={apply}
            onTryExample={() => apply(demo.example)}
          />
          <Collapsible isOpen={!isShowingResults}>
            <div className={styles.home}>
              <StarterQueryList queries={storefront.starterQueries} onPick={apply} />
              <ShortcutList />
            </div>
          </Collapsible>
          {isShowingResults && (
            <ResultSection
              outcome={outcome}
              cartProductIds={cart.productIds}
              onSearch={apply}
              onPickSort={pickSort}
              onToggleCart={toggleCart}
            />
          )}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

// The placeholder only animates once the shopper has been still this long.
const DEMO_IDLE_DELAY_IN_MILLISECONDS = 4000;

// Only the newest search may update the screen, so a slow early one never wins.
function useSearchOutcome(
  container: Container,
  initial: SearchOutcome,
  text: string,
  sort: SearchSort,
): SearchOutcome {
  const [outcome, setOutcome] = useState(initial);
  const latestRequest = useRef(0);

  useEffect(() => {
    latestRequest.current += 1;
    const request = latestRequest.current;
    window.history.replaceState(null, "", searchUrl({ text, sort }));
    container.searchCatalog.execute({ text, sort }).then((next) => {
      if (request === latestRequest.current) setOutcome(next);
    }, reportError);
  }, [container, text, sort]);

  return outcome;
}

const EMPTY_CART: CartSummary = { productIds: [], itemCount: 0 };

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
