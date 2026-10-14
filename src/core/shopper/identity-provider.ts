import type { Shopper } from "./shopper";

export interface IdentityProvider {
  currentShopper(): Promise<Shopper>;
}
