"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import type { Container } from "@/composition";
import type { ProductId, SearchSort } from "@/core";
import type { SearchOutcome, Storefront as StorefrontData } from "@/use-case";
import { replaceAddress } from "./address-history";
import { useBrowsing, useInPlaceSearch } from "./browsing-context";
import { useCart } from "./cart-context";
import { Collapsible } from "./collapsible";
import { useContainer } from "./container-context";
import { recoverFocus } from "./focus-recovery";
import { scrollToTop } from "./motion";
import { RESULTS_HEADLINE_ID, ResultSection } from "./result-section";
import { SearchPanel } from "./search-panel";
import { searchUrl } from "./search-url";
import { ShortcutList } from "./shortcut-list";
import { StarterQueryList } from "./starter-query-list";
import styles from "./storefront.module.css";
import { useDocumentTitle } from "./use-document-title";
import { useIdle } from "./use-idle";
import { useSearchText } from "./use-search-text";
import { useTypingDemo } from "./use-typing-demo";

type StorefrontProps = {
  initialOutcome: SearchOutcome;
  storefront: StorefrontData;
};

export function Storefront({ initialOutcome, storefront }: StorefrontProps) {
  const container = useContainer();
  const { cart, toggleCart } = useCart();
  const { productModal, openProduct } = useBrowsing();
  const { text, searchText, type, apply } = useSearchText(initialOutcome.text);
  const [sort, setSort] = useState(initialOutcome.requestedSort);
  const { outcome, lastResults } = useSearchOutcome(container, initialOutcome, searchText, sort);
  const isIdle = useIdle(DEMO_IDLE_DELAY_IN_MILLISECONDS);
  const demo = useTypingDemo(storefront.starterQueries, text === "" && isIdle);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useAddressInStepWithScreen(searchText, sort, productModal.productId);
  useDocumentTitle(outcome.hasQuery ? outcome.headline : null);
  // The layout follows the search that ran, not each keystroke, so it changes once, after
  // the pause, and the hero folds away instead of vanishing under the caret.
  const isShowingResults = outcome.hasQuery;
  // Chips, suggestions, sort options, and relaxations belong to the last search. Until the
  // newer typed text has been searched they would throw that text away, so picking one then
  // searches the typed text instead. A bar the shopper emptied has nothing to lose.
  const isUpdating = text !== outcome.text;
  const keepsTypedText = isUpdating && text.trim() !== "";

  // Set only when the choice changes the bar or the search; a choice that changes neither
  // would never be cleared, and a later, unrelated search would move focus.
  const chosenTextRef = useRef<string | null>(null);
  const choose = useCallback(
    (nextText: string) => {
      const changesNothing = nextText === text && nextText === outcome.text;
      chosenTextRef.current = changesNothing ? null : nextText;
      apply(nextText);
    },
    [apply, text, outcome.text],
  );

  const pick = useCallback(
    (nextText: string) => choose(keepsTypedText ? text : nextText),
    [choose, keepsTypedText, text],
  );

  useFocusRecovery({ chosenTextRef, isShowingResults, text, searchedText: outcome.text, inputRef });
  // While the home page is open, the header's department menu and logo search in place.
  useInPlaceSearch(choose);

  const pickSort = useCallback(
    (nextSort: SearchSort, nextText: string) => {
      setSort(nextSort);
      pick(nextText);
    },
    [pick],
  );

  return (
    <main className={isShowingResults ? styles.mainWithResults : styles.mainEmpty}>
      <Collapsible isOpen={!isShowingResults}>
        <Hero />
      </Collapsible>
      <SearchPanel
        inputRef={inputRef}
        text={text}
        results={lastResults}
        isShowingResults={isShowingResults}
        isUpdating={keepsTypedText}
        placeholder={demo.placeholder}
        onType={type}
        onApply={apply}
        onPick={pick}
        onTryExample={() => choose(demo.example)}
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
            cartProductIds={cart.productIds}
            onSearch={pick}
            onBrowse={choose}
            onPickSort={pickSort}
            onOpenProduct={openProduct}
            onToggleCart={(productId) => {
              toggleCart(productId).catch(reportError);
            }}
          />
        )}
      </Collapsible>
    </main>
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
    container.searchCatalog.execute({ text, sort }).then((next) => {
      // Only the newest search may update the screen, so a slow early one never wins.
      if (request !== latestRequest.current) return;
      setOutcome(next);
      if (next.hasQuery) setLastResults(next);
    }, reportError);
  }, [container, text, sort]);

  return { outcome, lastResults };
}

// The address always says what the screen shows: the search that ran, its sort, and the
// open product. It is written after every change has rendered, including a Back or
// Forward, so a search that landed while a product was open is never lost from it.
function useAddressInStepWithScreen(text: string, sort: SearchSort, productId: ProductId | null) {
  useEffect(() => {
    replaceAddress(searchUrl({ text, sort, productId }));
  }, [text, sort, productId]);
}

const DEMO_IDLE_DELAY_IN_MILLISECONDS = 4000;

type FocusRecoveryInputs = {
  chosenTextRef: RefObject<string | null>;
  isShowingResults: boolean;
  text: string;
  searchedText: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
};

// Watches the bar as well as the search, because choosing the text that was already
// searched (the example arrow on an emptied bar) changes only the bar (focus-recovery.ts).
function useFocusRecovery(inputs: FocusRecoveryInputs) {
  const { chosenTextRef, isShowingResults, text, searchedText, inputRef } = inputs;
  useEffect(() => {
    const recovery = recoverFocus({
      chosenText: chosenTextRef.current,
      searchedText,
      text,
      isFocusLost: isFocusLost(document.activeElement),
      isShowingResults,
    });
    if (recovery.isSettled) chosenTextRef.current = null;
    if (recovery.target === "results-headline") {
      document.getElementById(RESULTS_HEADLINE_ID)?.focus({ preventScroll: true });
    }
    if (recovery.target === "search-input") inputRef.current?.focus({ preventScroll: true });
  }, [chosenTextRef, isShowingResults, text, searchedText, inputRef]);
}

// Focus is lost when it fell back to the page itself or sits inside folded, inert content.
function isFocusLost(active: Element | null): boolean {
  return active === null || active === document.body || active.closest("[inert]") !== null;
}

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
