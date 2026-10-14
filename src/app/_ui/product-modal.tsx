"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { ProductId } from "@/core";
import type { ProductView, ReviewView, ViewProduct } from "@/use-case";
import { deliveryLabel, formatRating, formatReviewDate, pluralize } from "./format";
import { Icon } from "./icon";
import { type CarouselControl, ImageCarousel } from "./image-carousel";
import { Price } from "./price";
import styles from "./product-modal.module.css";
import type { ProductPreview } from "./product-preview";
import { StarRating } from "./star-rating";

type ProductModalProps = {
  productId: ProductId | null;
  preview: ProductPreview | null;
  viewProduct: ViewProduct;
  cartProductIds: readonly ProductId[];
  onToggleCart: (productId: ProductId) => void;
  onClose: () => void;
};

// A native modal dialog: the page behind is inert, focus stays inside, Escape closes it,
// and focus returns to the product that opened it (ADR 0029). It shows what was on
// screen at once and fills in the details when they arrive. The details come first in
// the DOM, so the dialog focuses the close button on opening and screen readers hear the
// name before the photos; the grid still draws the photos on the left.
export function ProductModal({
  productId,
  preview,
  viewProduct,
  cartProductIds,
  onToggleCart,
  onClose,
}: ProductModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const carouselRef = useRef<CarouselControl>(null);
  const titleId = useId();
  const view = useProductView(viewProduct, productId, onClose);
  useModalDialog(dialogRef, productId !== null);
  const shownPreview = preview !== null && preview.id === productId ? preview : null;
  const summary = view ?? shownPreview;
  const images = view?.images ?? previewImages(shownPreview);

  // Closing by Escape is the browser's; closing because the product went away is ours,
  // and must not close a second time.
  function closeFromBrowser() {
    if (productId !== null) onClose();
  }

  // The arrow keys turn the photos wherever focus is in the dialog.
  function stepPhotos(event: KeyboardEvent<HTMLDialogElement>) {
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
                {summary !== null && <StarRating rating={summary.rating} />}
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
              {view === null ? <LoadingDetails /> : <ProductInformation view={view} />}
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
                <CartButton
                  productId={summary.id}
                  name={summary.name}
                  availability={cartAvailability(view)}
                  isInCart={cartProductIds.includes(summary.id)}
                  onToggleCart={onToggleCart}
                />
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

function useModalDialog(dialogRef: RefObject<HTMLDialogElement | null>, isOpen: boolean) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [dialogRef, isOpen]);
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

function ProductInformation({ view }: { view: ProductView }) {
  return (
    <>
      {view.features.length > 0 && (
        <ul className={styles.features} aria-label="Features">
          {view.features.map((feature) => (
            <li key={feature} className={styles.feature}>
              {feature}
            </li>
          ))}
        </ul>
      )}
      {view.description !== null && <p className={styles.description}>{view.description}</p>}
      <dl className={styles.facts}>
        {view.availability !== null && (
          <Fact label="Availability">
            <span className={view.availability.canBuy ? styles.inStock : styles.outOfStock}>
              {view.availability.label}
            </span>
          </Fact>
        )}
        {view.facts.map((fact) => (
          <Fact key={fact.label} label={fact.label}>
            {fact.value}
          </Fact>
        ))}
      </dl>
      <Reviews rating={view.rating} reviews={view.reviews} />
    </>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.fact}>
      <dt className={styles.factLabel}>{label}</dt>
      <dd className={styles.factValue}>{children}</dd>
    </div>
  );
}

type ReviewsProps = {
  rating: number;
  reviews: readonly ReviewView[];
};

function Reviews({ rating, reviews }: ReviewsProps) {
  const headingId = useId();
  return (
    <section className={styles.reviews} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle}>
        Ratings and reviews
      </h3>
      <div className={styles.ratingSummary}>
        <span className={styles.ratingValue}>{formatRating(rating)}</span>
        <div>
          <StarRating rating={rating} isLarge showsValue={false} />
          <p className={styles.reviewCount}>{pluralize(reviews.length, "review", "reviews")}</p>
        </div>
      </div>
      <ul className={styles.reviewList}>
        {reviews.map((review) => (
          <li key={review.id} className={styles.review}>
            <span className={styles.avatar} aria-hidden="true">
              {initialsOf(review.reviewerName)}
            </span>
            <div className={styles.reviewBody}>
              <p className={styles.reviewer}>
                <strong>{review.reviewerName}</strong>
                <time className={styles.reviewDate} dateTime={review.date}>
                  {formatReviewDate(review.date)}
                </time>
              </p>
              <StarRating rating={review.rating} showsValue={false} />
              <p className={styles.comment}>{review.comment}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((part) => part !== "")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

type CartAvailability = "loading" | "buyable" | "sold-out";

// Until the details say whether the product is in stock, the button waits.
function cartAvailability(view: ProductView | null): CartAvailability {
  if (view === null) return "loading";
  return view.availability?.canBuy === false ? "sold-out" : "buyable";
}

type CartButtonProps = {
  productId: ProductId;
  name: string;
  availability: CartAvailability;
  isInCart: boolean;
  onToggleCart: (productId: ProductId) => void;
};

function CartButton({ productId, name, availability, isInCart, onToggleCart }: CartButtonProps) {
  if (availability !== "buyable" && !isInCart) {
    return (
      <button type="button" className={styles.cartButton} disabled>
        {availability === "loading" ? "Add to cart" : "Out of stock"}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={isInCart ? styles.cartButtonAdded : styles.cartButton}
      aria-label={isInCart ? `Remove ${name} from cart` : `Add ${name} to cart`}
      onClick={() => onToggleCart(productId)}
    >
      <Icon name={isInCart ? "check" : "add-to-cart"} size={22} strokeWidth={2.4} />
      {isInCart ? "In cart" : "Add to cart"}
    </button>
  );
}
