import type { ProductSource } from "@/core";
import {
  optionalString,
  requireArray,
  requireNumber,
  requireRecord,
  requireString,
  requireStringArray,
} from "@/core";

export type RawDummyJsonProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  // The source states prices in decimal dollars; normalisation converts them to cents.
  priceInDollars: number;
  discountPercentage: number;
  rating: number;
  tags: readonly string[];
  brand: string | null;
  thumbnail: string | null;
  images: readonly string[];
  shippingInformation: string;
  warrantyInformation: string | null;
  returnPolicy: string | null;
  availabilityStatus: string | null;
  stock: number;
  reviews: readonly RawReview[];
};

// Reviewer email addresses in the source are never read, so they cannot reach the app.
export type RawReview = {
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
};

export type RawFakeStoreProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  priceInDollars: number;
  rating: number;
  reviewCount: number;
  image: string | null;
};

// The source's response read once, so the products and their details come from the same
// parse.
export type ParsedSource =
  | { source: "dummyjson"; products: readonly RawDummyJsonProduct[] }
  | { source: "fakestore"; products: readonly RawFakeStoreProduct[] };

export function parseSource(source: ProductSource, json: unknown): ParsedSource {
  return source === "dummyjson"
    ? { source, products: parseDummyJsonResponse(json) }
    : { source, products: parseFakeStoreResponse(json) };
}

export function parseDummyJsonResponse(json: unknown): RawDummyJsonProduct[] {
  const root = requireRecord(json, "DummyJSON response");
  return requireArray(root.products, "DummyJSON products").map((item, index) => {
    const context = `DummyJSON product ${index}`;
    const record = requireRecord(item, context);
    return {
      id: requireNumber(record, "id", context),
      title: requireString(record, "title", context),
      description: requireString(record, "description", context),
      category: requireString(record, "category", context),
      priceInDollars: requireNumber(record, "price", context),
      discountPercentage: requireNumber(record, "discountPercentage", context),
      rating: requireNumber(record, "rating", context),
      tags: requireStringArray(record, "tags", context),
      brand: optionalString(record, "brand", context),
      thumbnail: optionalString(record, "thumbnail", context),
      images: requireStringArray(record, "images", context),
      shippingInformation: requireString(record, "shippingInformation", context),
      warrantyInformation: optionalString(record, "warrantyInformation", context),
      returnPolicy: optionalString(record, "returnPolicy", context),
      availabilityStatus: optionalString(record, "availabilityStatus", context),
      stock: requireNumber(record, "stock", context),
      reviews: requireArray(record.reviews, `${context} reviews`).map((review, reviewIndex) =>
        parseReview(review, `${context} review ${reviewIndex}`),
      ),
    };
  });
}

function parseReview(value: unknown, context: string): RawReview {
  const record = requireRecord(value, context);
  return {
    reviewerName: requireString(record, "reviewerName", context),
    rating: requireNumber(record, "rating", context),
    comment: requireString(record, "comment", context),
    date: requireString(record, "date", context),
  };
}

export function parseFakeStoreResponse(json: unknown): RawFakeStoreProduct[] {
  return requireArray(json, "FakeStoreAPI response").map((item, index) => {
    const context = `FakeStoreAPI product ${index}`;
    const record = requireRecord(item, context);
    const rating = requireRecord(record.rating, `${context} rating`);
    return {
      id: requireNumber(record, "id", context),
      title: requireString(record, "title", context),
      description: requireString(record, "description", context),
      category: requireString(record, "category", context),
      priceInDollars: requireNumber(record, "price", context),
      rating: requireNumber(rating, "rate", `${context} rating`),
      reviewCount: requireNumber(rating, "count", `${context} rating`),
      image: optionalString(record, "image", context),
    };
  });
}
