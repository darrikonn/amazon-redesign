import type { Metadata } from "next";
import { BuyAgainView } from "../_ui/buy-again-view";
import { requireShopper } from "../_ui/require-shopper";

export const metadata: Metadata = { title: "Buy again" };

export default async function BuyAgainPage() {
  await requireShopper("/buy-again");
  return <BuyAgainView />;
}
