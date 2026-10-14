import type {
  CartLineRepository,
  Clock,
  OrderRepository,
  ProductDetailsRepository,
  ProductRepository,
  SavedItemRepository,
  SessionStore,
} from "@/core";
import {
  ChangeCartQuantity,
  ChangeDeliveryLocation,
  ListOrders,
  PlaceOrder,
  SearchCatalog,
  SignIn,
  SignOut,
  StartReturn,
  ToggleCartItem,
  ToggleSavedItem,
  ViewBuyAgain,
  ViewCart,
  ViewDeals,
  ViewOrder,
  ViewProduct,
  ViewSavedList,
  ViewSession,
  ViewStorefront,
} from "@/use-case";

export type Container = {
  searchCatalog: SearchCatalog;
  viewStorefront: ViewStorefront;
  viewProduct: ViewProduct;
  viewSession: ViewSession;
  signIn: SignIn;
  signOut: SignOut;
  changeDeliveryLocation: ChangeDeliveryLocation;
  viewCart: ViewCart;
  toggleCartItem: ToggleCartItem;
  changeCartQuantity: ChangeCartQuantity;
  placeOrder: PlaceOrder;
  listOrders: ListOrders;
  viewOrder: ViewOrder;
  startReturn: StartReturn;
  viewBuyAgain: ViewBuyAgain;
  viewDeals: ViewDeals;
  toggleSavedItem: ToggleSavedItem;
  viewSavedList: ViewSavedList;
};

export type Ports = {
  products: ProductRepository;
  productDetails: ProductDetailsRepository;
  cartLines: CartLineRepository;
  orders: OrderRepository;
  savedItems: SavedItemRepository;
  sessions: SessionStore;
  clock: Clock;
};

export function assembleContainer(ports: Ports): Container {
  const { products, productDetails, cartLines, orders, savedItems, sessions, clock } = ports;
  return {
    searchCatalog: new SearchCatalog(products),
    viewStorefront: new ViewStorefront(),
    viewProduct: new ViewProduct(products, productDetails),
    viewSession: new ViewSession(sessions),
    signIn: new SignIn(sessions, cartLines, orders, products, productDetails, clock),
    signOut: new SignOut(sessions),
    changeDeliveryLocation: new ChangeDeliveryLocation(sessions),
    viewCart: new ViewCart(sessions, cartLines, products),
    toggleCartItem: new ToggleCartItem(sessions, cartLines, products),
    changeCartQuantity: new ChangeCartQuantity(sessions, cartLines, products),
    placeOrder: new PlaceOrder(sessions, cartLines, orders, products, productDetails, clock),
    listOrders: new ListOrders(sessions, orders, clock),
    viewOrder: new ViewOrder(sessions, orders, clock),
    startReturn: new StartReturn(sessions, orders, clock),
    viewBuyAgain: new ViewBuyAgain(sessions, orders, products, clock),
    viewDeals: new ViewDeals(products, clock),
    toggleSavedItem: new ToggleSavedItem(sessions, savedItems, products, clock),
    viewSavedList: new ViewSavedList(sessions, savedItems, products),
  };
}
