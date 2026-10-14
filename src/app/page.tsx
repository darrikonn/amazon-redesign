import { createContainer } from "@/composition";
import { type RawSearchParameters, readSearchParameters } from "./_ui/search-url";
import { Storefront } from "./_ui/storefront";

type HomePageProps = {
  searchParams: Promise<RawSearchParameters>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const search = readSearchParameters(await searchParams);
  const container = createContainer();
  const [outcome, storefront] = await Promise.all([
    container.searchCatalog.execute(search),
    container.viewStorefront.execute(),
  ]);
  return <Storefront initialOutcome={outcome} storefront={storefront} />;
}
