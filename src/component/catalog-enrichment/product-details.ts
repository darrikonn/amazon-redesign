import type { ProductDetails, ProductReview } from "@/core";
import { availabilityFrom } from "../product-fact";
import { compareText } from "../text";
import type {
  ParsedSource,
  RawDummyJsonProduct,
  RawFakeStoreProduct,
  RawReview,
} from "./raw-source";
import { blankToNull, productIdFor } from "./source-text";

export function buildProductDetails(parsed: ParsedSource): ProductDetails[] {
  const details =
    parsed.source === "dummyjson"
      ? parsed.products.map(dummyJsonDetails)
      : parsed.products.map(fakeStoreDetails);
  return details.sort((first, second) => compareText(first.productId, second.productId));
}

function dummyJsonDetails(raw: RawDummyJsonProduct): ProductDetails {
  return {
    productId: productIdFor("dummyjson", raw.id),
    description: raw.description.trim(),
    images: photosOrThumbnail(raw.images, raw.thumbnail),
    availability: availabilityFrom(raw.availabilityStatus),
    stock: raw.stock,
    shipping: blankToNull(raw.shippingInformation),
    warranty: blankToNull(raw.warrantyInformation),
    returnPolicy: blankToNull(raw.returnPolicy),
    reviews: raw.reviews.map(toReview),
  };
}

function fakeStoreDetails(raw: RawFakeStoreProduct): ProductDetails {
  return {
    productId: productIdFor("fakestore", raw.id),
    description: raw.description.trim(),
    images: photosOrThumbnail([], raw.image),
    availability: null,
    stock: null,
    shipping: null,
    warranty: null,
    returnPolicy: null,
    reviews: [],
  };
}

function photosOrThumbnail(images: readonly string[], fallback: string | null): string[] {
  const photos = images.flatMap((image) => {
    const photo = blankToNull(image);
    return photo === null ? [] : [photo];
  });
  const thumbnail = blankToNull(fallback);
  if (photos.length > 0 || thumbnail === null) return photos;
  return [thumbnail];
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
