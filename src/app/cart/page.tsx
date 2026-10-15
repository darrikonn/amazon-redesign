import { CartPageView } from "../_ui/cart-page-view";
import { titledPage } from "../_ui/page-metadata";
import { SHOP_PLACES } from "../_ui/shop-place";

export const generateMetadata = titledPage(SHOP_PLACES.cart);

export default function CartPage() {
  return <CartPageView />;
}
