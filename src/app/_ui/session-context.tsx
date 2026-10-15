"use client";

import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { ChangeDeliveryLocationResult, ShopperView, SignInResult } from "@/use-case";
import { useCart } from "./cart-context";
import { useContainer } from "./container-context";
import { useSavedList } from "./saved-list-context";

export type Session = {
  shopper: ShopperView | null;
  signIn: (email: string) => Promise<SignInResult>;
  signOut: () => Promise<void>;
  changeDeliveryLocation: (postalCode: string) => Promise<ChangeDeliveryLocationResult>;
};

const SessionContext = createContext<Session | null>(null);

type SessionProviderProps = {
  initialShopper: ShopperView | null;
  children: ReactNode;
};

// Signing in or out changes whose cart and list are shown, so both load again.
export function SessionProvider({ initialShopper, children }: SessionProviderProps) {
  const container = useContainer();
  const router = useRouter();
  const { reloadCart } = useCart();
  const { reloadSavedList } = useSavedList();
  const [shopper, setShopper] = useState(initialShopper);

  const reloadShopperData = useCallback(
    () => Promise.all([reloadCart(), reloadSavedList()]),
    [reloadCart, reloadSavedList],
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

  const value = useMemo<Session>(
    () => ({ shopper, signIn, signOut, changeDeliveryLocation }),
    [shopper, signIn, signOut, changeDeliveryLocation],
  );
  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (session === null) throw new Error("useSession is used outside the ShopProvider");
  return session;
}
