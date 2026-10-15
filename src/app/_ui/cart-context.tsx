"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ProductId } from "@/core";
import type { CartSummary } from "@/use-case";
import { useContainer } from "./container-context";

export type Cart = {
  cart: CartSummary;
  toggleCart: (productId: ProductId) => Promise<void>;
  replaceCart: (cart: CartSummary) => void;
  reloadCart: () => Promise<void>;
};

const CartContext = createContext<Cart | null>(null);

// The cart lives in the browser, so it loads after the first render (ADR 0030).
export function CartProvider({ children }: { children: ReactNode }) {
  const container = useContainer();
  const [cart, setCart] = useState<CartSummary>(EMPTY_CART);

  const reloadCart = useCallback(async () => {
    setCart(await container.viewCart.execute());
  }, [container]);

  useEffect(() => {
    let isCurrent = true;
    container.viewCart.execute().then((loaded) => {
      if (isCurrent) setCart(loaded);
    }, reportError);
    return () => {
      isCurrent = false;
    };
  }, [container]);

  const toggleCart = useCallback(
    async (productId: ProductId) => {
      setCart(await container.toggleCartItem.execute({ productId }));
    },
    [container],
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
