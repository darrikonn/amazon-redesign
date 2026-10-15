import type { Metadata } from "next";
import { cookies } from "next/headers";
import { cache } from "react";
import { createContainer } from "@/composition";
import { openProductName } from "./_ui/page-metadata";
import { shopTitle } from "./_ui/page-title";
import { type RawSearchParameters, readSearchParameters } from "./_ui/search-url";
import { Storefront } from "./_ui/storefront";

type HomePageProps = {
  searchParams: Promise<RawSearchParameters>;
};

// The tab names what the address shows: an open product, or the search's headline. The
// layout's title template does not reach a page in its own segment, so the whole title is
// given here.
export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const raw = await searchParams;
  const productName = await openProductName(raw);
  if (productName !== null) return { title: shopTitle(productName) };
  const search = readSearchParameters(raw);
  const outcome = await searchFor(search.text, search.sort);
  return outcome.hasQuery ? { title: shopTitle(outcome.headline) } : {};
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const search = readSearchParameters(await searchParams);
  const [outcome, storefront] = await Promise.all([
    searchFor(search.text, search.sort),
    createContainer(await cookies()).viewStorefront.execute(),
  ]);
  return <Storefront initialOutcome={outcome} storefront={storefront} />;
}

// The tab's title and the page read the same search, so it runs once per request.
const searchFor = cache(async (text: string, sort: string) =>
  createContainer(await cookies()).searchCatalog.execute({ text, sort }),
);
