"use client";

import type { ProductId } from "@/core";
import { useAnnounce } from "./announcer-context";
import { useCart } from "./cart-context";
import page from "./shop-page.module.css";

type OrderLineCartButtonProps = {
  productId: ProductId;
  name: string;
};

// The same button before and after, so keyboard focus stays on it; its label says what
// pressing it next will do, and the status region says what just happened.
export function OrderLineCartButton({ productId, name }: OrderLineCartButtonProps) {
  const { cart, toggleCart } = useCart();
  const announce = useAnnounce();
  const isInCart = cart.productIds.includes(productId);

  async function toggle() {
    await toggleCart(productId);
    announce(isInCart ? `${name} removed from your cart` : `${name} added to your cart`);
  }

  return (
    <button
      type="button"
      className={isInCart ? page.secondaryButtonDone : page.secondaryButton}
      aria-label={
        isInCart ? `In your cart: remove ${name}` : `Buy it again: add ${name} to your cart`
      }
      onClick={() => {
        toggle().catch(reportError);
      }}
    >
      {isInCart ? "In your cart" : "Buy it again"}
    </button>
  );
}
