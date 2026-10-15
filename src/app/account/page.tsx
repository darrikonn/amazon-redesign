import type { Metadata } from "next";
import { AccountView } from "../_ui/account-view";
import { requireShopper } from "../_ui/require-shopper";
import { SHOP_PLACES } from "../_ui/shop-place";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  await requireShopper(SHOP_PLACES.account.href);
  return <AccountView />;
}
