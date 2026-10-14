import type { Metadata } from "next";
import { OrderDetailView } from "../../_ui/order-detail-view";
import { requireShopper } from "../../_ui/require-shopper";
import type { RawSearchParameters } from "../../_ui/search-url";

export const metadata: Metadata = { title: "Order details" };

type OrderPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<RawSearchParameters>;
};

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { orderId } = await params;
  const { placed } = await searchParams;
  await requireShopper(`/orders/${encodeURIComponent(orderId)}`);
  return <OrderDetailView orderId={orderId} isJustPlaced={placed === "1"} />;
}
