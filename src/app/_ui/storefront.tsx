"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Container, createContainer } from "@/composition";
import type { ProductId, SearchSort } from "@/core";
import type { CartSummary, SearchOutcome, Storefront as StorefrontData } from "@/use-case";
import { GlowGradient } from "./product-illustration";
import { ResultSection } from "./result-section";
import { SearchPanel } from "./search-panel";
import { searchUrl } from "./search-url";
import { ShortcutList } from "./shortcut-list";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { StarterQueryList } from "./starter-query-list";
import styles from "./storefront.module.css";
import { useTypingDemo } from "./use-typing-demo";

type StorefrontProps = {
  initialOutcome: SearchOutcome;
  initialPreviewLabels: readonly string[];
  storefront: StorefrontData;
};

export function Storefront({ initialOutcome, initialPreviewLabels, storefront }: StorefrontProps) {
  const [container] = useState(createContainer);
  const [text, setText] = useState(initialOutcome.text);
  const [sort, setSort] = useState(initialOutcome.requestedSort);
  const outcome = useSearchOutcome(container, initialOutcome, text, sort);
  const [cart, setCart] = useState<CartSummary>(EMPTY_CART);
  const demo = useTypingDemo(storefront.starterQueries, text === "");
  const previewLabels = usePreviewLabels(container, demo.placeholder, initialPreviewLabels);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasQuery = text.trim() !== "";

  useEffect(() => {
    container.viewCart.execute().then(setCart, reportError);
  }, [container]);

  const pickSort = useCallback((nextSort: SearchSort, nextText: string) => {
    setSort(nextSort);
    setText(nextText);
  }, []);

  const toggleCart = useCallback(
    (productId: ProductId) => {
      container.toggleCartItem.execute({ productId }).then(setCart, reportError);
    },
    [container],
  );

  return (
    <div className={styles.page}>
      <GlowGradient />
      <div className={styles.viewport}>
        <SiteHeader
          shopper={storefront.shopper}
          departments={storefront.departments}
          cartCount={cart.itemCount}
          onSearch={setText}
        />
        <main className={hasQuery ? styles.mainWithResults : styles.mainEmpty}>
          {!hasQuery && <Hero />}
          <SearchPanel
            inputRef={inputRef}
            text={text}
            outcome={outcome}
            placeholder={demo.placeholder}
            previewLabels={previewLabels}
            onTextChange={setText}
            onTryExample={() => setText(demo.example)}
          />
          {hasQuery ? (
            <ResultSection
              outcome={outcome}
              cartProductIds={cart.productIds}
              onSearch={setText}
              onPickSort={pickSort}
              onToggleCart={toggleCart}
            />
          ) : (
            <div className={styles.home}>
              <StarterQueryList queries={storefront.starterQueries} onPick={setText} />
              <ShortcutList />
            </div>
          )}
        </main>
      </div>
      <SiteFooter />
    </div>
  );
}

// Every keystroke starts a search; only the newest one may update the screen.
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

function usePreviewLabels(
  container: Container,
  placeholder: string,
  initial: readonly string[],
): readonly string[] {
  const [labels, setLabels] = useState(initial);

  useEffect(() => {
    let isCurrent = true;
    container.previewQuery.execute(placeholder).then((preview) => {
      if (isCurrent) setLabels(preview.labels);
    }, reportError);
    return () => {
      isCurrent = false;
    };
  }, [container, placeholder]);

  return labels;
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
