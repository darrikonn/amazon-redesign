import type { CartLineRepository, IdentityProvider, ProductRepository } from "@/core";
import { SearchCatalog, ToggleCartItem, ViewCart, ViewStorefront } from "@/use-case";

export type Container = {
  searchCatalog: SearchCatalog;
  viewStorefront: ViewStorefront;
  viewCart: ViewCart;
  toggleCartItem: ToggleCartItem;
};

export type Ports = {
  products: ProductRepository;
  cartLines: CartLineRepository;
  identity: IdentityProvider;
};

export function assembleContainer(ports: Ports): Container {
  return {
    searchCatalog: new SearchCatalog(ports.products),
    viewStorefront: new ViewStorefront(ports.identity),
    viewCart: new ViewCart(ports.identity, ports.cartLines),
    toggleCartItem: new ToggleCartItem(ports.identity, ports.cartLines, ports.products),
  };
}
