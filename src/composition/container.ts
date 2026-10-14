import type {
  CartLineRepository,
  IdentityProvider,
  ProductDetailsRepository,
  ProductRepository,
} from "@/core";
import { SearchCatalog, ToggleCartItem, ViewCart, ViewProduct, ViewStorefront } from "@/use-case";

export type Container = {
  searchCatalog: SearchCatalog;
  viewStorefront: ViewStorefront;
  viewCart: ViewCart;
  toggleCartItem: ToggleCartItem;
  viewProduct: ViewProduct;
};

export type Ports = {
  products: ProductRepository;
  productDetails: ProductDetailsRepository;
  cartLines: CartLineRepository;
  identity: IdentityProvider;
};

export function assembleContainer(ports: Ports): Container {
  return {
    searchCatalog: new SearchCatalog(ports.products),
    viewStorefront: new ViewStorefront(ports.identity),
    viewCart: new ViewCart(ports.identity, ports.cartLines),
    toggleCartItem: new ToggleCartItem(ports.identity, ports.cartLines, ports.products),
    viewProduct: new ViewProduct(ports.products, ports.productDetails),
  };
}
