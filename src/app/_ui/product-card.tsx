import type { Color } from "@/core";
import type { ProductListing } from "@/use-case";
import { deliveryLabel, formatRating, formatReviewCount, splitPrice } from "./format";
import { Icon } from "./icon";
import styles from "./product-card.module.css";
import { ProductIllustration } from "./product-illustration";

type ProductCardProps = {
  listing: ProductListing;
  isInCart: boolean;
  onToggleCart: (productId: string) => void;
};

export function ProductCard({ listing, isInCart, onToggleCart }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.well} style={{ color: INK[listing.color] }}>
        {listing.isBestMatch && <span className={styles.bestMatch}>Best match</span>}
        <ProductIllustration
          shape={listing.illustration.shape}
          isMirrored={listing.illustration.isMirrored}
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{listing.title}</h3>
        <p className={styles.details}>
          {listing.details.map((detail, index) => (
            <span key={detail} className={index === 2 ? styles.thirdDetail : styles.detail}>
              {index > 0 && " · "}
              {detail}
            </span>
          ))}
        </p>
        <Rating rating={listing.rating} reviewCount={listing.reviewCount} />
        {listing.highlightLabel !== null && (
          <p className={styles.highlight}>
            <Icon name="check" size={15} strokeWidth={3.5} className={styles.highlightIcon} />
            {listing.highlightLabel}
          </p>
        )}
        <div className={styles.footer}>
          <div className={styles.purchase}>
            <Price priceInCents={listing.priceInCents} />
            <p className={styles.delivery}>
              FREE delivery{" "}
              <strong className={styles.deliveryDate}>{deliveryLabel(listing.deliveryDays)}</strong>
            </p>
          </div>
          <button
            type="button"
            className={isInCart ? styles.cartButtonAdded : styles.cartButton}
            aria-label={
              isInCart ? `Remove ${listing.title} from cart` : `Add ${listing.title} to cart`
            }
            onClick={() => onToggleCart(listing.id)}
          >
            <Icon
              name={isInCart ? "check" : "add-to-cart"}
              size={24}
              strokeWidth={isInCart ? 2.6 : 2}
            />
          </button>
        </div>
      </div>
    </article>
  );
}

const INK: Record<Color, string> = {
  black: "#232f3e",
  white: "#fbfcfc",
  blue: "#2f6fb5",
  green: "#3f7d5a",
  red: "#c0392b",
  grey: "#8a9199",
  brass: "#b08d3c",
  wood: "#a9773f",
  navy: "#1f3a5f",
};

const STARS = "★★★★★";
const MAXIMUM_RATING = 5;

function Rating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  const filled = `${Math.round((rating / MAXIMUM_RATING) * 100)}%`;
  return (
    <p className={styles.rating}>
      <span className="visually-hidden">
        {formatRating(rating)} out of 5 stars, {formatReviewCount(reviewCount)} reviews
      </span>
      <span className={styles.stars} aria-hidden="true">
        {STARS}
        <span className={styles.starsFilled} style={{ width: filled }}>
          {STARS}
        </span>
      </span>
      <span className={styles.ratingValue} aria-hidden="true">
        {formatRating(rating)}
      </span>
      <span aria-hidden="true">({formatReviewCount(reviewCount)})</span>
    </p>
  );
}

function Price({ priceInCents }: { priceInCents: number }) {
  const price = splitPrice(priceInCents);
  return (
    <p className={styles.price}>
      <span className="visually-hidden">{price.spoken}</span>
      <span className={styles.priceSymbol} aria-hidden="true">
        $
      </span>
      <span className={styles.priceDollars} aria-hidden="true">
        {price.dollars}
      </span>
      <span className={styles.priceCents} aria-hidden="true">
        {price.cents}
      </span>
    </p>
  );
}
