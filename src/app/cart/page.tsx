import type { Metadata } from "next";
import { CartPageView } from "../_ui/cart-page-view";

export const metadata: Metadata = { title: "Your cart" };

export default function CartPage() {
  return <CartPageView />;
}
