"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { type Container, createContainer } from "@/composition";
import type { ProductId } from "@/core";
import type {
  CartSummary,
  ChangeDeliveryLocationResult,
  ShopperView,
  SignInResult,
  ToggleSavedItemResult,
} from "@/use-case";
import type { ProductPreview } from "./product-preview";
import { searchUrl } from "./search-url";
import { type ProductModalState, useProductModal } from "./use-product-modal";

export type Shop = {
  container: Container;
  shopper: ShopperView | null;
  cart: CartSummary;
  savedProductIds: readonly ProductId[];
  productModal: ProductModalState;
  productPreview: ProductPreview | null;
  openProduct: (preview: ProductPreview) => void;
  toggleCart: (productId: ProductId) => Promise<void>;
  showCart: (cart: CartSummary) => void;
  toggleSaved: (productId: ProductId) => Promise<ToggleSavedItemResult>;
  signIn: (email: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  changeDeliveryLocation: (postalCode: string) => Promise<ChangeDeliveryLocationResult>;
  search: (text: string) => void;
  searchHandlerRef: RefObject<((text: string) => void) | null>;
};

const ShopContext = createContext<Shop | null>(null);

type ShopProviderProps = {
  initialShopper: ShopperView | null;
  initialProductId: ProductId | null;
  children: ReactNode;
};

// One container for the whole visit, kept above the pages so the session, the cart count,
// the saved list, and the product modal survive moving between them (ADR 0030).
export function ShopProvider({ initialShopper, initialProductId, children }: ShopProviderProps) {
  const router = useRouter();
  const [container] = useState(createContainer);
  const [shopper, setShopper] = useState(initialShopper);
  const [cart, setCart] = useState<CartSummary>(EMPTY_CART);
  const [savedProductIds, setSavedProductIds] = useState<readonly ProductId[]>([]);
  const [productPreview, setProductPreview] = useState<ProductPreview | null>(null);
  const productModal = useProductModal(initialProductId);
  const searchHandlerRef = useRef<((text: string) => void) | null>(null);

  // The cart and list live in the browser, so they load after the first render, and again
  // whenever someone signs in or out.
  const reloadShopperData = useCallback(async () => {
    const data = await loadShopperData(container);
    setCart(data.cart);
    setSavedProductIds(data.savedProductIds);
  }, [container]);

  useEffect(() => {
    let isCurrent = true;
    loadShopperData(container).then((data) => {
      if (!isCurrent) return;
      setCart(data.cart);
      setSavedProductIds(data.savedProductIds);
    }, reportError);
    return () => {
      isCurrent = false;
    };
  }, [container]);

  const { open: openProductModal } = productModal;
  const openProduct = useCallback(
    (preview: ProductPreview) => {
      setProductPreview(preview);
      openProductModal(preview.id);
    },
    [openProductModal],
  );

  const toggleCart = useCallback(
    async (productId: ProductId) => {
      setCart(await container.toggleCartItem.execute({ productId }));
    },
    [container],
  );

  const toggleSaved = useCallback(
    async (productId: ProductId) => {
      const result = await container.toggleSavedItem.execute({ productId });
      if (result.status !== "signed-out") setSavedProductIds(result.list.productIds);
      return result;
    },
    [container],
  );

  const signIn = useCallback(
    async (email: string) => {
      const result = await container.signIn.execute({ email });
      if (result.status === "signed-in") {
        setShopper(result.shopper);
        await reloadShopperData();
      }
      return result;
    },
    [container, reloadShopperData],
  );

  // Pages rendered on the server for the signed-in shopper are refreshed, so none keeps
  // showing their name.
  const signOut = useCallback(async () => {
    await container.signOut.execute();
    setShopper(null);
    await reloadShopperData();
    router.refresh();
  }, [container, router, reloadShopperData]);

  const changeDeliveryLocation = useCallback(
    async (postalCode: string) => {
      const result = await container.changeDeliveryLocation.execute({ postalCode });
      if (result.status === "changed") setShopper(result.shopper);
      return result;
    },
    [container],
  );

  // On the home page the search runs in place; elsewhere it goes to the home page.
  const search = useCallback(
    (text: string) => {
      const handler = searchHandlerRef.current;
      if (handler === null) router.push(searchUrl({ text, sort: "best-match" }));
      else handler(text);
    },
    [router],
  );

  const shop = useMemo<Shop>(
    () => ({
      container,
      shopper,
      cart,
      savedProductIds,
      productModal,
      productPreview,
      openProduct,
      toggleCart,
      showCart: setCart,
      toggleSaved,
      signIn,
      signOut,
      changeDeliveryLocation,
      search,
      searchHandlerRef,
    }),
    [
      container,
      shopper,
      cart,
      savedProductIds,
      productModal,
      productPreview,
      openProduct,
      toggleCart,
      toggleSaved,
      signIn,
      signOut,
      changeDeliveryLocation,
      search,
    ],
  );

  return <ShopContext value={shop}>{children}</ShopContext>;
}

export function useShop(): Shop {
  const shop = useContext(ShopContext);
  if (shop === null) throw new Error("useShop is used outside the ShopProvider");
  return shop;
}

const EMPTY_CART: CartSummary = { productIds: [], itemCount: 0 };

type ShopperData = {
  cart: CartSummary;
  savedProductIds: readonly ProductId[];
};

async function loadShopperData(container: Container): Promise<ShopperData> {
  const [cart, list] = await Promise.all([
    container.viewCart.execute(),
    container.viewSavedList.execute(),
  ]);
  return { cart, savedProductIds: list?.productIds ?? [] };
}
