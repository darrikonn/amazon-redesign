"use client";

import { type ReactNode, useState } from "react";
import { createContainer } from "@/composition";
import type { ShopperView } from "@/use-case";
import { AnnouncerProvider } from "./announcer-context";
import { BrowsingProvider } from "./browsing-context";
import { CartProvider } from "./cart-context";
import { ContainerContext } from "./container-context";
import { SavedListProvider } from "./saved-list-context";
import { SessionProvider } from "./session-context";

type ShopProviderProps = {
  initialShopper: ShopperView | null;
  children: ReactNode;
};

// One container for the whole visit, kept above the pages so the session, the cart count,
// the saved list, and the product modal survive moving between them (ADR 0030). Each is its
// own context, so a page depends only on what it uses.
export function ShopProvider({ initialShopper, children }: ShopProviderProps) {
  const [container] = useState(createContainer);
  return (
    <ContainerContext value={container}>
      <AnnouncerProvider>
        <CartProvider>
          <SavedListProvider>
            <SessionProvider initialShopper={initialShopper}>
              <BrowsingProvider>{children}</BrowsingProvider>
            </SessionProvider>
          </SavedListProvider>
        </CartProvider>
      </AnnouncerProvider>
    </ContainerContext>
  );
}
