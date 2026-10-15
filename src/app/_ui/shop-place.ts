import type { IconName } from "./icon";

export type ShopPlace = {
  href: string;
  icon: IconName;
  title: string;
  description: string;
};

// Every page of the shop is named the same wherever it is linked from.
export const SHOP_PLACES = {
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
