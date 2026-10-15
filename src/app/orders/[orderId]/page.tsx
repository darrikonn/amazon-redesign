import type { Metadata } from "next";
import { OrderDetailView } from "../../_ui/order-detail-view";
import { requireShopper } from "../../_ui/require-shopper";
import type { RawSearchParameters } from "../../_ui/search-url";
import { isJustPlaced, JUST_PLACED_PARAMETER, orderHref } from "../../_ui/shop-place";

export const metadata: Metadata = { title: "Order details" };

type OrderPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<RawSearchParameters>;
};

export default async function OrderPage({ params, searchParams }: OrderPageProps) {
  const { orderId } = await params;
  const parameters = await searchParams;
  await requireShopper(orderHref(orderId));
  return (
    <OrderDetailView
      orderId={orderId}
      isJustPlaced={isJustPlaced(parameters[JUST_PLACED_PARAMETER])}
    />
  );
}
