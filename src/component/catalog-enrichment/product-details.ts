import type { Availability, ProductDetails, ProductReview, ProductSource } from "@/core";
import { isAvailability } from "@/core";
import {
  parseDummyJsonResponse,
  parseFakeStoreResponse,
  type RawDummyJsonProduct,
  type RawFakeStoreProduct,
  type RawReview,
} from "./raw-source";
import { blankToNull, compareText, productIdFor } from "./source-text";

// The details file, in the same product order as the catalogue (ADR 0029).
export function buildProductDetails(source: ProductSource, rawResponse: unknown): ProductDetails[] {
  const details =
    source === "dummyjson"
      ? parseDummyJsonResponse(rawResponse).map(dummyJsonDetails)
      : parseFakeStoreResponse(rawResponse).map(fakeStoreDetails);
  return details.sort((first, second) => compareText(first.productId, second.productId));
}

export function dummyJsonDetails(raw: RawDummyJsonProduct): ProductDetails {
  return {
    productId: productIdFor("dummyjson", raw.id),
    description: raw.description.trim(),
    images: photosOf(raw.images, raw.thumbnail),
    availability: availabilityFrom(raw.availabilityStatus),
    stock: raw.stock,
    shipping: blankToNull(raw.shippingInformation),
    warranty: blankToNull(raw.warrantyInformation),
    returnPolicy: blankToNull(raw.returnPolicy),
    reviews: raw.reviews.map(toReview),
  };
}

export function fakeStoreDetails(raw: RawFakeStoreProduct): ProductDetails {
  return {
    productId: productIdFor("fakestore", raw.id),
    description: raw.description.trim(),
    images: photosOf([], raw.image),
    availability: null,
    stock: null,
    shipping: null,
    warranty: null,
    returnPolicy: null,
    reviews: [],
  };
}

// The full-size photos, or the thumbnail when the source has none.
function photosOf(images: readonly string[], fallback: string | null): string[] {
  const photos = images.flatMap((image) => {
    const photo = blankToNull(image);
    return photo === null ? [] : [photo];
  });
  const thumbnail = blankToNull(fallback);
  if (photos.length > 0 || thumbnail === null) return photos;
  return [thumbnail];
}

// The source writes "In Stock", "Low Stock", and "Out of Stock".
export function availabilityFrom(status: string | null): Availability | null {
  const slug = (status ?? "").trim().toLowerCase().replaceAll(/\s+/g, "-");
  return isAvailability(slug) ? slug : null;
}

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}/;

function toReview(raw: RawReview): ProductReview {
  const date = CALENDAR_DATE.exec(raw.date)?.[0];
  if (date === undefined)
    throw new Error(`Review by ${raw.reviewerName}: unreadable date "${raw.date}"`);
  return {
    reviewerName: raw.reviewerName.trim(),
    rating: raw.rating,
    comment: raw.comment.trim(),
    date,
  };
}
