"use client";

import type { ProductId } from "@/core";
import { useCart } from "./cart-context";
import page from "./shop-page.module.css";

type OrderLineCartButtonProps = {
  productId: ProductId;
  name: string;
};

// The same button before and after, so keyboard focus stays on it; its label says what
// pressing it next will do, and the cart says aloud what just happened.
export function OrderLineCartButton({ productId, name }: OrderLineCartButtonProps) {
  const { cart, toggleCart } = useCart();
  const isInCart = cart.productIds.includes(productId);
  return (
    <button
      type="button"
      className={page.secondaryButton}
      aria-label={isInCart ? `Remove from cart: ${name}` : `Buy it again: add ${name} to your cart`}
      onClick={() => {
        toggleCart({ id: productId, name }).catch(reportError);
      }}
    >
      {isInCart ? "Remove from cart" : "Buy it again"}
    </button>
  );
}
