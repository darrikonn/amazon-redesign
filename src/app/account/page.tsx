import type { Metadata } from "next";
import { AccountView } from "../_ui/account-view";
import { requireShopper } from "../_ui/require-shopper";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  await requireShopper("/account");
  return <AccountView />;
}
