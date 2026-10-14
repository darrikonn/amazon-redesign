import {
  BrowserKeyValueStorage,
  BrowserSessionStore,
  CatalogProductDetailsRepository,
  CatalogProductRepository,
  RequestSessionStore,
  SESSION_COOKIE_NAME,
  StoredCartLineRepository,
  StoredOrderRepository,
  StoredSavedItemRepository,
  SystemClock,
} from "@/infrastructure";
import type { Ports } from "./container";

// What the server knows about the request: only its session cookie (ADR 0030).
export type RequestCookies = {
  get(name: string): { value: string } | undefined;
};

// The shop's ports for one environment: the browser reads and signs in through the
// session endpoint; the server, given the request's cookies, can only read the session.
export function shopPorts(requestCookies: RequestCookies | null): Ports {
  const storage = new BrowserKeyValueStorage();
  return {
    products: new CatalogProductRepository(),
    productDetails: new CatalogProductDetailsRepository(),
    cartLines: new StoredCartLineRepository(storage),
    orders: new StoredOrderRepository(storage),
    savedItems: new StoredSavedItemRepository(storage),
    sessions:
      requestCookies === null
        ? new BrowserSessionStore()
        : new RequestSessionStore(requestCookies.get(SESSION_COOKIE_NAME)?.value ?? null),
    clock: new SystemClock(),
  };
}
