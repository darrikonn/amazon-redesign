import { PRODUCT_FACT_RULES } from "./product-fact-rule";

// The rating shown is what the reviews say. DummyJSON's own rating field disagrees with
// its reviews (4.8 beside reviews of 5, 4, and 1), so the reviews win wherever there are
// any; a source without reviews keeps its own rating. One decimal, so 5, 4, and 1 are 3.3.
export function ratingFrom(reviews: readonly { rating: number }[], sourceRating: number): number {
  const rating = averageRating(reviews) ?? sourceRating;
  return (
    Math.round(rating * PRODUCT_FACT_RULES.ratingPrecision) / PRODUCT_FACT_RULES.ratingPrecision
  );
}

function averageRating(reviews: readonly { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  return reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
}
