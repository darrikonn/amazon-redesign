import type { IconName } from "./icon";

export type ShopPlace = {
  href: string;
  icon: IconName;
  title: string;
  description: string;
};

// Every page of the shop is named the same wherever it is linked from.
export const SHOP_PLACES = {
  home: {
    href: "/",
    icon: "search",
    title: "Start shopping",
    description: "Say what you need",
  },
  signIn: {
    href: "/sign-in",
    icon: "pin",
    title: "Sign in",
    description: "With any email, no password",
  },
  account: {
    href: "/account",
    icon: "pin",
    title: "Your account",
    description: "Delivery location and sign out",
  },
  orders: {
    href: "/orders",
    icon: "package",
    title: "Your orders",
    description: "Track, return, or buy again",
  },
  trackOrder: {
    href: "/orders?show=on-the-way",
    icon: "package",
    title: "Track an order",
    description: "Deliveries on the way",
  },
  buyAgain: {
    href: "/buy-again",
    icon: "refresh",
    title: "Buy again",
    description: "Your regular items",
  },
  list: { href: "/lists", icon: "heart", title: "Your list", description: "Products you saved" },
  deals: { href: "/deals", icon: "tag", title: "Today’s deals", description: "All in one place" },
  cart: { href: "/cart", icon: "cart", title: "Your cart", description: "Ready when you are" },
  help: {
    href: "/help",
    icon: "help",
    title: "Help",
    description: "Delivery, returns, and accessibility",
  },
} as const satisfies Record<string, ShopPlace>;

// An order's page; `placed` marks the visit right after checkout, which thanks the shopper.
export function orderHref(orderId: string, options: { isJustPlaced?: boolean } = {}): string {
  const path = `${SHOP_PLACES.orders.href}/${encodeURIComponent(orderId)}`;
  return options.isJustPlaced === true ? `${path}?${JUST_PLACED_PARAMETER}=1` : path;
}

export function orderReturnHref(orderId: string): string {
  return `${orderHref(orderId)}#${RETURN_FORM_ID}`;
}

export function isJustPlaced(value: string | string[] | undefined): boolean {
  return value === "1";
}

export const JUST_PLACED_PARAMETER = "placed";
export const RETURN_FORM_ID = "return";

export function orderListHref(show: string): string {
  return show === "all"
    ? SHOP_PLACES.orders.href
    : `${SHOP_PLACES.orders.href}?show=${encodeURIComponent(show)}`;
}

export type HelpTopicId = "delivery" | "returns" | "account" | "accessibility";

export function helpHref(topic: HelpTopicId): string {
  return `${SHOP_PLACES.help.href}#${topic}`;
}
