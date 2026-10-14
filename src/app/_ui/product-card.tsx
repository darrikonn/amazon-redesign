import type { Color, ProductId } from "@/core";
import type { ProductListing } from "@/use-case";
import { deliveryLabel, formatRating, splitPrice } from "./format";
import { Icon } from "./icon";
import styles from "./product-card.module.css";
import { ProductImage } from "./product-image";

type ProductCardProps = {
  listing: ProductListing;
  isInCart: boolean;
  onToggleCart: (productId: ProductId) => void;
};

export function ProductCard({ listing, isInCart, onToggleCart }: ProductCardProps) {
  return (
    <article className={styles.card}>
      <div
        className={styles.well}
        style={{ color: listing.color === null ? DEFAULT_INK : INK[listing.color] }}
      >
        {listing.isBestMatch && <span className={styles.bestMatch}>Best match</span>}
        <ProductImage image={listing.image} category={listing.category} />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>{listing.name}</h3>
        <p className={styles.details}>
          {listing.details.map((detail, index) => (
            <span key={detail} className={index === 2 ? styles.thirdDetail : styles.detail}>
              {index > 0 && " · "}
              {detail}
            </span>
          ))}
        </p>
        <Rating rating={listing.rating} />
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
              isInCart ? `Remove ${listing.name} from cart` : `Add ${listing.name} to cart`
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

// Glyph colours for each product colour; white is drawn off-white so it shows on the well.
const INK: Record<Color, string> = {
  "rose gold": "#b76e79",
  black: "#232f3e",
  white: "#fbfcfc",
  grey: "#8a9199",
  silver: "#a8b0b8",
  gold: "#c9a227",
  blue: "#2f6fb5",
  navy: "#1f3a5f",
  green: "#3f7d5a",
  red: "#c0392b",
  pink: "#d9648c",
  purple: "#6b3fa0",
  brown: "#7a4e2d",
  beige: "#c8b08a",
  yellow: "#e0b100",
  orange: "#e07a1f",
};

const DEFAULT_INK = "#232f3e";

const STARS = "★★★★★";
const MAXIMUM_RATING = 5;

// DummyJSON ships three sample reviews per product, so a count would mislead; only the
// rating is shown.
function Rating({ rating }: { rating: number }) {
  const filled = `${Math.round((rating / MAXIMUM_RATING) * 100)}%`;
  return (
    <p className={styles.rating}>
      <span className="visually-hidden">{formatRating(rating)} out of 5 stars</span>
      <span className={styles.stars} aria-hidden="true">
        {STARS}
        <span className={styles.starsFilled} style={{ width: filled }}>
          {STARS}
        </span>
      </span>
      <span className={styles.ratingValue} aria-hidden="true">
        {formatRating(rating)}
      </span>
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
