import {
  BrowserKeyValueStorage,
  BrowserSessionStore,
  CatalogProductDetailsRepository,
  CatalogProductRepository,
  type RequestCookieJar,
  RequestSessionStore,
  StoredCartLineRepository,
  StoredOrderRepository,
  StoredSavedItemRepository,
  SystemClock,
} from "@/infrastructure";
import type { Ports } from "./container";

// The shop's ports for one environment: in the browser the session goes through the
// session endpoint; on the server it is the request's own cookie.
export function shopPorts(requestCookies: RequestCookieJar | null): Ports {
  const storage = new BrowserKeyValueStorage();
  const clock = new SystemClock();
  return {
    products: new CatalogProductRepository(),
    productDetails: new CatalogProductDetailsRepository(),
    cartLines: new StoredCartLineRepository(storage, clock),
    orders: new StoredOrderRepository(storage, clock),
    savedItems: new StoredSavedItemRepository(storage, clock),
    sessions:
      requestCookies === null ? new BrowserSessionStore() : new RequestSessionStore(requestCookies),
    clock,
  };
}
