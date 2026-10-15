import { useId } from "react";
import type { ReviewView } from "@/use-case";
import { formatRating, formatReviewDate, pluralize } from "./format";
import styles from "./product-modal.module.css";
import { StarRating } from "./star-rating";

type ProductReviewsProps = {
  id: string;
  rating: number;
  reviews: readonly ReviewView[];
};

export function ProductReviews({ id, rating, reviews }: ProductReviewsProps) {
  const headingId = useId();
  return (
    <section id={id} className={styles.reviews} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.sectionTitle} tabIndex={-1}>
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
