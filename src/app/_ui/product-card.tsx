import Link from "next/link";
import type { MouseEvent } from "react";
import type { Color, ProductId } from "@/core";
import type { ProductListing } from "@/use-case";
import { deliveryLabel, splitPrice } from "./format";
import { Icon } from "./icon";
import { isPlainClick } from "./plain-click";
import { Price } from "./price";
import styles from "./product-card.module.css";
import { ProductPhoto } from "./product-photo";
import type { ProductPreview } from "./product-preview";
import { StarRating } from "./star-rating";

type ProductCardProps = {
  listing: ProductListing;
  href: string;
  isInCart: boolean;
  onOpen: (preview: ProductPreview) => void;
  onToggleCart: (productId: ProductId) => void;
};

// The title link stretches over the whole card, so the card opens the product anywhere
// it is clicked; only the cart button sits above it.
export function ProductCard({ listing, href, isInCart, onOpen, onToggleCart }: ProductCardProps) {
  function open(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainClick(event)) return;
    event.preventDefault();
    onOpen(listing);
  }

  return (
    <article className={styles.card}>
      <div
        className={styles.well}
        style={{ color: listing.color === null ? DEFAULT_INK : INK[listing.color] }}
      >
        {listing.isBestMatch && <span className={styles.bestMatch}>Best match</span>}
        {listing.deal !== null && (
          <span className={styles.dealBadge}>{listing.deal.discountPercent}% off</span>
        )}
        {/* Decorative: the title sits right below it. */}
        <ProductPhoto
          image={listing.image}
          category={listing.category}
          alt=""
          sizes="(max-width: 760px) 45vw, 300px"
          className={styles.photo}
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={href} className={styles.titleLink} prefetch={false} onClick={open}>
            {listing.name}
          </Link>
        </h3>
        <p className={styles.details}>
          {listing.details.map((detail, index) => (
            <span
              key={detail}
              className={
                index >= DETAILS_SHOWN_ON_PHONES ? styles.phoneHiddenDetail : styles.detail
              }
            >
              {index > 0 && " · "}
              {detail}
            </span>
          ))}
        </p>
        {/* DummyJSON ships three sample reviews per product, so a count would mislead; only
            the rating is shown. */}
        <p className={styles.rating}>
          <StarRating rating={listing.rating} />
        </p>
        {listing.highlightLabel !== null && (
          <p className={styles.highlight}>
            <Icon name="check" size={15} strokeWidth={3.5} className={styles.highlightIcon} />
            {listing.highlightLabel}
          </p>
        )}
        <div className={styles.footer}>
          <div className={styles.purchase}>
            <Price priceInCents={listing.priceInCents} />
            {listing.deal !== null && (
              <p className={styles.listPrice}>
                List price <s>{splitPrice(listing.deal.listPriceInCents).spoken}</s>
              </p>
            )}
            {listing.canBuy ? (
              <p className={styles.delivery}>
                FREE delivery{" "}
                <strong className={styles.deliveryDate}>
                  {deliveryLabel(listing.deliveryDays)}
                </strong>
              </p>
            ) : (
              <p className={styles.soldOut}>Currently out of stock</p>
            )}
          </div>
          <button
            type="button"
            className={isInCart ? styles.cartButtonAdded : styles.cartButton}
            aria-label={cartButtonLabel(listing, isInCart)}
            disabled={!listing.canBuy && !isInCart}
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

// A sold-out product cannot go in; one already in the cart can still come out.
function cartButtonLabel(listing: ProductListing, isInCart: boolean): string {
  if (isInCart) return `Remove ${listing.name} from cart`;
  return listing.canBuy ? `Add ${listing.name} to cart` : `${listing.name} is out of stock`;
}

// A phone card has room for two details; the rest wait for a wider screen.
const DETAILS_SHOWN_ON_PHONES = 2;

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
