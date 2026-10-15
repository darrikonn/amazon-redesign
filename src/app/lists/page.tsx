import { titledPage } from "../_ui/page-metadata";
import { requireShopper } from "../_ui/require-shopper";
import { SavedListView } from "../_ui/saved-list-view";
import { SHOP_PLACES } from "../_ui/shop-place";

export const generateMetadata = titledPage(SHOP_PLACES.list);

export default async function ListsPage() {
  await requireShopper(SHOP_PLACES.list.href);
  return <SavedListView />;
}
