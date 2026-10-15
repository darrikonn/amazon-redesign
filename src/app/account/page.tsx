import { AccountView } from "../_ui/account-view";
import { titledPage } from "../_ui/page-metadata";
import { requireShopper } from "../_ui/require-shopper";
import { SHOP_PLACES } from "../_ui/shop-place";

export const generateMetadata = titledPage(SHOP_PLACES.account);

export default async function AccountPage() {
  await requireShopper(SHOP_PLACES.account.href);
  return <AccountView />;
}
