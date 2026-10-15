import { BuyAgainView } from "../_ui/buy-again-view";
import { titledPage } from "../_ui/page-metadata";
import { requireShopper } from "../_ui/require-shopper";
import { SHOP_PLACES } from "../_ui/shop-place";

export const generateMetadata = titledPage(SHOP_PLACES.buyAgain);

export default async function BuyAgainPage() {
  await requireShopper(SHOP_PLACES.buyAgain.href);
  return <BuyAgainView />;
}
