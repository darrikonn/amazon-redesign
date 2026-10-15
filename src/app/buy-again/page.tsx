import type { Metadata } from "next";
import { BuyAgainView } from "../_ui/buy-again-view";
import { requireShopper } from "../_ui/require-shopper";
import { SHOP_PLACES } from "../_ui/shop-place";

export const metadata: Metadata = { title: "Buy again" };

export default async function BuyAgainPage() {
  await requireShopper(SHOP_PLACES.buyAgain.href);
  return <BuyAgainView />;
}
