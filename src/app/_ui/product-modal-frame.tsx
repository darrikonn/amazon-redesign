import type { ProductView } from "@/use-case";
import { deliveryLabel, pluralize } from "./format";
import { Icon } from "./icon";
import { prefersReducedMotion } from "./motion";
import { Price } from "./price";
import styles from "./product-modal.module.css";
import { CartButton, cartAvailability, SaveButton } from "./product-modal-actions";
import type { ProductPreview } from "./product-preview";
import { StarRating } from "./star-rating";

// What both the card that opened the modal and the full view know about the product.
type ProductSummary = Pick<ProductPreview, "id" | "name" | "priceInCents" | "rating">;

type ProductModalHeaderProps = {
  titleId: string;
  reviewsId: string;
  summary: ProductSummary | null;
  view: ProductView | null;
  onClose: () => void;
};

export function ProductModalHeader({
  titleId,
  reviewsId,
  summary,
  view,
  onClose,
}: ProductModalHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        {view !== null && view.brand !== null && <p className={styles.brand}>{view.brand}</p>}
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
      <button type="button" className={styles.closeButton} aria-label="Close" onClick={onClose}>
        <Icon name="close" size={20} strokeWidth={2.6} />
      </button>
    </header>
  );
}

// A button, not a #fragment link: a fragment would add a history entry, and Back is what
// closes the modal.
function showReviews(reviewsId: string) {
  const heading = document.getElementById(reviewsId)?.querySelector("h3");
  heading?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
  heading?.focus({ preventScroll: true });
}

type ProductModalFooterProps = {
  summary: ProductSummary;
  view: ProductView | null;
};

// The price and the cart stay in view at the bottom while the details scroll.
export function ProductModalFooter({ summary, view }: ProductModalFooterProps) {
  return (
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
  );
}
