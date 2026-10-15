"use client";

import { useEffect, useRef, useState } from "react";
import type { ProductId, SearchSort } from "@/core";
import type { SearchOutcome, Storefront as StorefrontData } from "@/use-case";
import { replaceAddress } from "./address-history";
import { useBrowsing, useInPlaceSearch } from "./browsing-context";
import { Collapsible } from "./collapsible";
import { useContainer } from "./container-context";
import { scrollToTop } from "./motion";
import { HOME_TITLE, shopTitle } from "./page-title";
import { ResultSection } from "./result-section";
import { SearchPanel } from "./search-panel";
import { searchUrl } from "./search-url";
import { ShortcutList } from "./shortcut-list";
import { StarterQueryList } from "./starter-query-list";
import styles from "./storefront.module.css";
import { useDocumentTitle } from "./use-document-title";
import { useIdle } from "./use-idle";
import { useSearchChoices } from "./use-search-choices";
import { useSearchOutcome } from "./use-search-outcome";
import { useSearchText } from "./use-search-text";
import { useTypingDemo } from "./use-typing-demo";

type StorefrontProps = {
  initialOutcome: SearchOutcome;
  storefront: StorefrontData;
};

export function Storefront({ initialOutcome, storefront }: StorefrontProps) {
  const container = useContainer();
  const { productModal } = useBrowsing();
  const { text, searchText, type, apply } = useSearchText(initialOutcome.text);
  const [sort, setSort] = useState(initialOutcome.requestedSort);
  const { outcome, lastResults } = useSearchOutcome(container, initialOutcome, searchText, sort);
  const isIdle = useIdle(DEMO_IDLE_DELAY_IN_MILLISECONDS);
  const demo = useTypingDemo(storefront.starterQueries, text === "" && isIdle);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // The layout follows the search that ran, not each keystroke, so it changes once, after
  // the pause, and the hero folds away instead of vanishing under the caret.
  const isShowingResults = outcome.hasQuery;
  const { isUpdating, keepsTypedText, choose, pick, pickSort } = useSearchChoices({
    text,
    searchedText: outcome.text,
    isShowingResults,
    inputRef,
    apply,
    setSort,
  });
  useAddressInStepWithScreen(searchText, sort, productModal.productId);
  useTopWhenResultsStart(isShowingResults);
  useDocumentTitle(outcome.hasQuery ? shopTitle(outcome.headline) : HOME_TITLE);
  // While the home page is open, the header's department menu and logo search in place.
  useInPlaceSearch(choose);

  return (
    <main className={isShowingResults ? styles.mainWithResults : styles.mainEmpty}>
      <Collapsible isOpen={!isShowingResults}>
        <Hero />
      </Collapsible>
      <SearchPanel
        bar={{
          inputRef,
          text,
          placeholder: demo.placeholder,
          onType: type,
          onApply: apply,
          onTryExample: () => choose(demo.example),
        }}
        rows={{ results: lastResults, isShowingResults, isUpdating: keepsTypedText, onPick: pick }}
      />
      <Collapsible isOpen={!isShowingResults}>
        <div className={styles.home}>
          <StarterQueryList
            queries={storefront.starterQueries}
            onPick={(query) => {
              choose(query);
              scrollToTop();
            }}
          />
          <ShortcutList />
        </div>
      </Collapsible>
      <Collapsible isOpen={isShowingResults}>
        {lastResults !== null && (
          <ResultSection
            outcome={lastResults}
            isUpdating={isUpdating}
            onSearch={pick}
            onBrowse={choose}
            onPickSort={pickSort}
          />
        )}
      </Collapsible>
    </main>
  );
}

// The address always says what the screen shows: the search that ran, its sort, and the
// open product. It is written after every change has rendered, including a Back or
// Forward, so a search that landed while a product was open is never lost from it.
function useAddressInStepWithScreen(text: string, sort: SearchSort, productId: ProductId | null) {
  useEffect(() => {
    replaceAddress(searchUrl({ text, sort, productId }));
  }, [text, sort, productId]);
}

// The hero folds away above the bar when the first results arrive, so a shopper who typed
// from further down the home page would be left with the bar, and the caret, off screen.
function useTopWhenResultsStart(isShowingResults: boolean) {
  const wasShowingRef = useRef(isShowingResults);
  useEffect(() => {
    if (isShowingResults && !wasShowingRef.current) scrollToTop();
    wasShowingRef.current = isShowingResults;
  }, [isShowingResults]);
}

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
