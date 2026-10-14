import { formatRating } from "./format";
import styles from "./star-rating.module.css";

type StarRatingProps = {
  rating: number;
  isLarge?: boolean;
  showsValue?: boolean;
};

const STARS = "★★★★★";
const MAXIMUM_RATING = 5;

export function StarRating({ rating, isLarge = false, showsValue = true }: StarRatingProps) {
  const filled = `${Math.round((rating / MAXIMUM_RATING) * 100)}%`;
  return (
    <span className={isLarge ? styles.ratingLarge : styles.rating}>
      <span className="visually-hidden">{formatRating(rating)} out of 5 stars</span>
      <span className={styles.stars} aria-hidden="true">
        {STARS}
        <span className={styles.starsFilled} style={{ width: filled }}>
          {STARS}
        </span>
      </span>
      {showsValue && (
        <span className={styles.value} aria-hidden="true">
          {formatRating(rating)}
        </span>
      )}
    </span>
  );
}
