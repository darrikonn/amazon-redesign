"use client";

import { createContext, useContext } from "react";
import type { Container } from "@/composition";

export const ContainerContext = createContext<Container | null>(null);

export function useContainer(): Container {
  const container = useContext(ContainerContext);
  if (container === null) throw new Error("useContainer is used outside the ShopProvider");
  return container;
}
