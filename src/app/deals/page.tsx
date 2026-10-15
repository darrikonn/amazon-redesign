import { DealsView } from "../_ui/deals-view";
import { titledPage } from "../_ui/page-metadata";
import { SHOP_PLACES } from "../_ui/shop-place";

export const generateMetadata = titledPage(SHOP_PLACES.deals);

export default function DealsPage() {
  return <DealsView />;
}
