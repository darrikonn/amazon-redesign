import type { Metadata } from "next";
import { cookies } from "next/headers";
import { createContainer } from "@/composition";
import {
  PRODUCT_PARAMETER,
  type RawSearchParameters,
  readSearchParameters,
} from "./_ui/search-url";
import { Storefront } from "./_ui/storefront";

type HomePageProps = {
  searchParams: Promise<RawSearchParameters>;
};

// The tab names what the address shows: an open product, or the search's headline.
export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const raw = await searchParams;
  const container = createContainer(await cookies());
  const productId = raw[PRODUCT_PARAMETER];
  if (typeof productId === "string") {
    const product = await container.viewProduct.execute({ productId });
    if (product !== null) return { title: product.name };
  }
  const outcome = await container.searchCatalog.execute(readSearchParameters(raw));
  return outcome.hasQuery ? { title: outcome.headline } : {};
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const search = readSearchParameters(await searchParams);
  const container = createContainer(await cookies());
  const [outcome, storefront] = await Promise.all([
    container.searchCatalog.execute(search),
    container.viewStorefront.execute(),
  ]);
  return <Storefront initialOutcome={outcome} storefront={storefront} />;
}
