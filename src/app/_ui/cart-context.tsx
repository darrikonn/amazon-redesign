"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { ProductId } from "@/core";
import type { CartSummary } from "@/use-case";
import { useAnnounce } from "./announcer-context";
import { useContainer } from "./container-context";
import { useLatestLoad } from "./use-latest-load";

export type CartProduct = {
  id: ProductId;
  name: string;
};

export type Cart = {
  cart: CartSummary;
  toggleCart: (product: CartProduct) => Promise<void>;
  replaceCart: (cart: CartSummary) => void;
  reloadCart: () => Promise<void>;
};

const CartContext = createContext<Cart | null>(null);

// The cart lives in the browser, so it loads after the first render (ADR 0030).
export function CartProvider({ children }: { children: ReactNode }) {
  const container = useContainer();
  const announce = useAnnounce();
  const [cart, setCart] = useState<CartSummary>(EMPTY_CART);

  const loadCart = useCallback(() => container.viewCart.execute(), [container]);
  useLatestLoad(loadCart, setCart);

  const reloadCart = useCallback(async () => {
    setCart(await loadCart());
  }, [loadCart]);

  // Every add and removal is said aloud, wherever its button is, since the button's own new
  // label is easy to miss.
  const toggleCart = useCallback(
    async (product: CartProduct) => {
      const next = await container.toggleCartItem.execute({ productId: product.id });
      setCart(next);
      announce(cartChangeMessage(product, next));
    },
    [container, announce],
  );

  const value = useMemo<Cart>(
    () => ({ cart, toggleCart, replaceCart: setCart, reloadCart }),
    [cart, toggleCart, reloadCart],
  );
  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): Cart {
  const cart = useContext(CartContext);
  if (cart === null) throw new Error("useCart is used outside the ShopProvider");
  return cart;
}

const EMPTY_CART: CartSummary = { productIds: [], itemCount: 0 };

function cartChangeMessage(product: CartProduct, cart: CartSummary): string {
  if (cart.productIds.includes(product.id)) return `${product.name} added to your cart`;
  return `${product.name} removed from your cart`;
}
