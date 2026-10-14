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
  rating: number;
  tags: readonly string[];
  brand: string | null;
  thumbnail: string | null;
  shippingInformation: string;
  reviewCount: number;
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
      rating: requireNumber(record, "rating", context),
      tags: requireStringArray(record, "tags", context),
      brand: optionalString(record, "brand", context),
      thumbnail: optionalString(record, "thumbnail", context),
      shippingInformation: requireString(record, "shippingInformation", context),
      reviewCount: requireArray(record.reviews, `${context} reviews`).length,
    };
  });
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
