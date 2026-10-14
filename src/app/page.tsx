import { createContainer } from "@/composition";
import { type RawSearchParameters, readSearchParameters } from "./_ui/search-url";
import { Storefront } from "./_ui/storefront";

type HomePageProps = {
  searchParams: Promise<RawSearchParameters>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const search = readSearchParameters(await searchParams);
  const container = createContainer();
  const storefront = await container.viewStorefront.execute();
  const [outcome, preview] = await Promise.all([
    container.searchCatalog.execute(search),
    container.previewQuery.execute(storefront.starterQueries[0] ?? ""),
  ]);
  return (
    <Storefront
      initialOutcome={outcome}
      initialSort={search.sort}
      initialPreviewLabels={preview.labels}
      storefront={storefront}
    />
  );
}
