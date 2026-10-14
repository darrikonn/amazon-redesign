import type { Metadata } from "next";
import { OrdersView } from "../_ui/orders-view";
import { requireShopper } from "../_ui/require-shopper";
import type { RawSearchParameters } from "../_ui/search-url";

export const metadata: Metadata = { title: "Your orders" };

type OrdersPageProps = {
  searchParams: Promise<RawSearchParameters>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const { show } = await searchParams;
  const filter = typeof show === "string" ? show : "all";
  await requireShopper(filter === "all" ? "/orders" : `/orders?show=${encodeURIComponent(filter)}`);
  return <OrdersView show={filter} />;
}
