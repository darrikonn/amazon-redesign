"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import type { ProductId } from "@/core";
import type { ProductView, ViewProduct } from "@/use-case";
import { useBrowsing } from "./browsing-context";
import { useContainer } from "./container-context";
import { deliveryLabel, pluralize } from "./format";
import { Icon } from "./icon";
import { type CarouselControl, ImageCarousel } from "./image-carousel";
import { prefersReducedMotion } from "./motion";
import { Price } from "./price";
import { ProductInformation } from "./product-information";
import styles from "./product-modal.module.css";
import { CartButton, cartAvailability, SaveButton } from "./product-modal-actions";
import type { ProductPreview } from "./product-preview";
import { StarRating } from "./star-rating";
import { useDocumentTitle } from "./use-document-title";
import { useModalDialog } from "./use-modal-dialog";

// A native modal dialog: the page behind is inert, focus stays inside, Escape closes it,
// and focus returns to the product that opened it (ADR 0029). It shows what was on
// screen at once and fills in the details when they arrive. The details come first in
// the DOM, so the dialog focuses the close button on opening and screen readers hear the
// name before the photos; the grid still draws the photos on the left.
export function ProductModal() {
  const { productModal, productPreview: preview } = useBrowsing();
  const { productId, close: onClose } = productModal;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const carouselRef = useRef<CarouselControl>(null);
  const titleId = useId();
  const reviewsId = useId();
  const view = useProductView(useContainer().viewProduct, productId, onClose);
  useModalDialog(dialogRef, productId !== null);
  const shownPreview = preview !== null && preview.id === productId ? preview : null;
  const summary = view ?? shownPreview;
  const images = view?.images ?? previewImages(shownPreview);
  useDocumentTitle(summary?.name ?? null);

  // Closing by Escape is the browser's; closing because the product went away is ours,
  // and must not close a second time.
  function closeFromBrowser() {
    if (productId !== null) onClose();
  }

  // A modified arrow belongs to the browser (Alt+Left is Back), so only a plain one turns
  // the photos.
  function stepPhotos(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (event.key === "ArrowLeft") carouselRef.current?.step(-1);
    if (event.key === "ArrowRight") carouselRef.current?.step(1);
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={closeFromBrowser}
      onKeyDown={stepPhotos}
    >
      {/* The frame, and its close button, render as soon as a product is open, even before
          anything about it is known (a shared link), so the dialog's first focus always
          lands on the close button. */}
      {productId !== null && (
        <div className={styles.frame}>
          <div className={styles.details}>
            <header className={styles.header}>
              <div className={styles.titleBlock}>
                {view !== null && view.brand !== null && (
                  <p className={styles.brand}>{view.brand}</p>
                )}
                <h2 id={titleId} className={styles.title}>
                  {summary === null ? "Loading product" : summary.name}
                </h2>
                {summary !== null && (
                  <div className={styles.ratingLine}>
                    <StarRating rating={summary.rating} />
                    {view !== null && view.reviews.length > 0 && (
                      <button
                        type="button"
                        className={styles.reviewsLink}
                        onClick={() => showReviews(reviewsId)}
                      >
                        {pluralize(view.reviews.length, "review", "reviews")}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close"
                onClick={onClose}
              >
                <Icon name="close" size={20} strokeWidth={2.6} />
              </button>
            </header>
            <div className={styles.body}>
              {view === null ? (
                <LoadingDetails />
              ) : (
                <ProductInformation view={view} reviewsId={reviewsId} />
              )}
            </div>
            {summary !== null && (
              <footer className={styles.footer}>
                <div>
                  <Price priceInCents={summary.priceInCents} />
                  {view !== null && view.availability?.canBuy !== false && (
                    <p className={styles.delivery}>
                      FREE delivery <strong>{deliveryLabel(view.deliveryDays)}</strong>
                    </p>
                  )}
                </div>
                <div className={styles.actions}>
                  <SaveButton productId={summary.id} name={summary.name} />
                  <CartButton
                    productId={summary.id}
                    name={summary.name}
                    availability={cartAvailability(view)}
                  />
                </div>
              </footer>
            )}
          </div>
          <div className={styles.media}>
            {summary !== null && (
              <ImageCarousel
                key={summary.id}
                ref={carouselRef}
                images={images}
                name={summary.name}
                category={summary.category}
              />
            )}
          </div>
        </div>
      )}
      {/* The dim area around the frame; Escape and the close button do the same. It comes
          last so the dialog's first focus lands on the close button, not here. */}
      <button
        type="button"
        className={styles.backdrop}
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
      />
    </dialog>
  );
}

// A product that does not exist (an old or edited link) closes the modal again.
function useProductView(
  viewProduct: ViewProduct,
  productId: ProductId | null,
  onMissing: () => void,
): ProductView | null {
  const [loaded, setLoaded] = useState<ProductView | null>(null);

  useEffect(() => {
    if (productId === null) return;
    let isCurrent = true;
    viewProduct.execute({ productId }).then((view) => {
      if (!isCurrent) return;
      if (view === null) onMissing();
      else setLoaded(view);
    }, reportError);
    return () => {
      isCurrent = false;
    };
  }, [viewProduct, productId, onMissing]);

  return loaded !== null && loaded.id === productId ? loaded : null;
}

// A button, not a #fragment link: a fragment would add a history entry, and Back is what
// closes the modal.
function showReviews(reviewsId: string) {
  const heading = document.getElementById(reviewsId)?.querySelector("h3");
  heading?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  heading?.focus({ preventScroll: true });
}

function previewImages(preview: ProductPreview | null): readonly string[] {
  return preview === null || preview.image === null ? [] : [preview.image];
}

function LoadingDetails() {
  return (
    <div className={styles.loading} role="status">
      <span className="visually-hidden">Loading product details</span>
      <span className={styles.loadingLine} />
      <span className={styles.loadingLine} />
      <span className={styles.loadingLineShort} />
    </div>
  );
}
