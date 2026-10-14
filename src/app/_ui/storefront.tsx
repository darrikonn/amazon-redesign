"use client";

import { type RefObject, useCallback, useEffect, useRef, useState } from "react";
import type { Container } from "@/composition";
import type { ProductId, SearchSort } from "@/core";
import type { SearchOutcome, Storefront as StorefrontData } from "@/use-case";
import { Collapsible } from "./collapsible";
import { scrollToTop } from "./motion";
import { RESULTS_HEADLINE_ID, ResultSection } from "./result-section";
import { SearchPanel } from "./search-panel";
import { searchUrl } from "./search-url";
import { useShop } from "./shop-context";
import { ShortcutList } from "./shortcut-list";
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
  const { container, cart, productModal, openProduct, toggleCart, searchHandlerRef } = useShop();
  const { text, searchText, type, apply } = useSearchText(initialOutcome.text);
  const [sort, setSort] = useState(initialOutcome.requestedSort);
  const { outcome, lastResults } = useSearchOutcome(container, initialOutcome, searchText, sort);
  const isIdle = useIdle(DEMO_IDLE_DELAY_IN_MILLISECONDS);
  const demo = useTypingDemo(storefront.starterQueries, text === "" && isIdle);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useAddressInStepWithScreen(searchText, sort, productModal.productId);
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

  useFocusRecovery(chosenTextRef, isShowingResults, text, outcome.text, inputRef);
  useHeaderSearch(searchHandlerRef, choose);

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
    window.history.replaceState(window.history.state, "", searchUrl({ text, sort, productId }));
  }, [text, sort, productId]);
}

const DEMO_IDLE_DELAY_IN_MILLISECONDS = 4000;

// Choosing something can fold away the very control that was used (a starter query, the
// last chip, the example arrow), which would leave keyboard focus nowhere.
// Focus then moves to the results headline, or back to the input on the way home.
function useFocusRecovery(
  chosenTextRef: RefObject<string | null>,
  isShowingResults: boolean,
  text: string,
  searchedText: string,
  inputRef: RefObject<HTMLTextAreaElement | null>,
) {
  // Watches the bar as well as the search, because choosing the text that was already
  // searched (the example arrow on an emptied bar) changes only the bar. Once the shopper
  // has typed something else, focus is theirs and is left alone.
  useEffect(() => {
    const chosenText = chosenTextRef.current;
    if (chosenText === null || searchedText !== chosenText) return;
    chosenTextRef.current = null;
    if (text !== chosenText) return;
    const active = document.activeElement;
    if (active !== null && active !== document.body && active.closest("[inert]") === null) return;
    const target = isShowingResults
      ? document.getElementById(RESULTS_HEADLINE_ID)
      : inputRef.current;
    target?.focus({ preventScroll: true });
  }, [chosenTextRef, isShowingResults, text, searchedText, inputRef]);
}

// While the home page is open, the header's department menu and logo search in place.
function useHeaderSearch(
  handlerRef: RefObject<((text: string) => void) | null>,
  choose: (text: string) => void,
) {
  useEffect(() => {
    handlerRef.current = choose;
    return () => {
      handlerRef.current = null;
    };
  }, [handlerRef, choose]);
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
