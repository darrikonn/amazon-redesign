import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createContainer } from "@/composition";
import { PRODUCT_PARAMETER, type RawSearchParameters } from "./search-url";

type PageMetadataProps = {
  searchParams: Promise<RawSearchParameters>;
};

// A page's tab names the product open over it (a shared link, a reload), and the page
// otherwise; the layout's template adds the shop's name.
export function titledPage(pageTitle: string) {
  return async function generateMetadata({ searchParams }: PageMetadataProps): Promise<Metadata> {
    const productId = (await searchParams)[PRODUCT_PARAMETER];
    if (typeof productId !== "string") return { title: pageTitle };
    const product = await createContainer(await cookies()).viewProduct.execute({ productId });
    return { title: product === null ? pageTitle : product.name };
  };
}
