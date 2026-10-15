import { HelpView } from "../_ui/help-view";
import { titledPage } from "../_ui/page-metadata";
import { SHOP_PLACES } from "../_ui/shop-place";

export const generateMetadata = titledPage(SHOP_PLACES.help);

export default function HelpPage() {
  return <HelpView />;
}
