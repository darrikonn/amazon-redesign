import { CartPageView } from "../_ui/cart-page-view";
import { titledPage } from "../_ui/page-metadata";

export const generateMetadata = titledPage("Your cart");

export default function CartPage() {
  return <CartPageView />;
}
