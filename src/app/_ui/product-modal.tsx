"use client";

import { type KeyboardEvent, useCallback, useId, useMemo, useRef, useState } from "react";
import type { ProductId } from "@/core";
import type { ProductView, ViewProduct } from "@/use-case";
import { useBrowsing } from "./browsing-context";
import { useContainer } from "./container-context";
import { type CarouselControl, ImageCarousel } from "./image-carousel";
import { shopTitle } from "./page-title";
import { ProductInformation } from "./product-information";
import styles from "./product-modal.module.css";
import { ProductModalFooter, ProductModalHeader } from "./product-modal-frame";
import type { ProductPreview } from "./product-preview";
import { useDocumentTitle } from "./use-document-title";
import { useLatestLoad } from "./use-latest-load";
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
  useDocumentTitle(summary === null ? null : shopTitle(summary.name));

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
            <ProductModalHeader
              titleId={titleId}
              reviewsId={reviewsId}
              summary={summary}
              view={view}
              onClose={onClose}
            />
            <div className={styles.body}>
              {view === null ? (
                <LoadingDetails />
              ) : (
                <ProductInformation view={view} reviewsId={reviewsId} />
              )}
            </div>
            {summary !== null && <ProductModalFooter summary={summary} view={view} />}
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
  const load = useMemo(
    () => (productId === null ? null : () => viewProduct.execute({ productId })),
    [viewProduct, productId],
  );
  const show = useCallback(
    (view: ProductView | null) => {
      if (view === null) onMissing();
      else setLoaded(view);
    },
    [onMissing],
  );
  useLatestLoad(load, show);

  return loaded !== null && loaded.id === productId ? loaded : null;
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
