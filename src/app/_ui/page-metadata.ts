import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createContainer } from "@/composition";
import { PRODUCT_PARAMETER, type RawSearchParameters } from "./search-url";
import type { ShopPlace } from "./shop-place";

type PageMetadataProps = {
  searchParams: Promise<RawSearchParameters>;
};

// A page's tab names the product open over it (a shared link, a reload), and the page
// otherwise; the layout's template adds the shop's name.
export function titledPage(place: ShopPlace) {
  return async function generateMetadata({ searchParams }: PageMetadataProps): Promise<Metadata> {
    return { title: (await openProductName(await searchParams)) ?? place.title };
  };
}

// The name of the product the address opens, or null when it opens none it knows.
export async function openProductName(searchParams: RawSearchParameters): Promise<string | null> {
  const productId = searchParams[PRODUCT_PARAMETER];
  if (typeof productId !== "string") return null;
  const product = await createContainer(await cookies()).viewProduct.execute({ productId });
  return product?.name ?? null;
}
