import { cookies } from "next/headers";
import { createContainer } from "@/composition";
import {
  type RawSearchParameters,
  readProductParameter,
  readSearchParameters,
} from "./_ui/search-url";
import { Storefront } from "./_ui/storefront";

type HomePageProps = {
  searchParams: Promise<RawSearchParameters>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const parameters = await searchParams;
  const search = readSearchParameters(parameters);
  const container = createContainer(await cookies());
  const [outcome, storefront, session] = await Promise.all([
    container.searchCatalog.execute(search),
    container.viewStorefront.execute(),
    container.viewSession.execute(),
  ]);
  return (
    <Storefront
      initialOutcome={outcome}
      initialProductId={readProductParameter(parameters)}
      storefront={storefront}
      shopper={session.shopper}
    />
  );
}
