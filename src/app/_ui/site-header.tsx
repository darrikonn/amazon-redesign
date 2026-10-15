"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useState } from "react";
import type { Department } from "@/use-case";
import { AccountMenu } from "./account-menu";
import { AmazonLogo } from "./amazon-logo";
import { useBrowsing } from "./browsing-context";
import { useCart } from "./cart-context";
import { DepartmentMenu } from "./department-menu";
import { deliveryLocationLabel, pluralize } from "./format";
import { Icon } from "./icon";
import { LocationDialog } from "./location-dialog";
import { isPlainClick } from "./plain-click";
import { useSession } from "./session-context";
import { SHOP_PLACES } from "./shop-place";
import { signInHref } from "./sign-in-href";
import styles from "./site-header.module.css";
import { useCurrentAddress } from "./use-current-address";

type SiteHeaderProps = {
  departments: readonly Department[];
};

export function SiteHeader({ departments }: SiteHeaderProps) {
  const { shopper } = useSession();
  const { cart } = useCart();
  const { search } = useBrowsing();
  const pathname = usePathname();
  const signIn = signInHref(useCurrentAddress());
  const [isChoosingLocation, setIsChoosingLocation] = useState(false);

  // On the home page the logo clears the search in place, like a fresh visit.
  function goHome(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/" || !isPlainClick(event)) return;
    event.preventDefault();
    search("");
  }

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <DepartmentMenu departments={departments} />
        <Link href="/" className={styles.logo} aria-label="Amazon home" onClick={goHome}>
          <AmazonLogo />
        </Link>
      </div>
      <div className={styles.navigation}>
        <AccountMenu onChangeLocation={() => setIsChoosingLocation(true)} />
        <Link
          href={SHOP_PLACES.cart.href}
          className={styles.cartLink}
          aria-label={`Cart, ${pluralize(cart.itemCount, "item", "items")}`}
        >
          <Icon name="cart" size={24} />
          <span className={styles.cartWord}>Cart</span>
          <span className={styles.cartCount}>{cart.itemCount}</span>
        </Link>
      </div>
      {shopper === null ? (
        <Link href={signIn} className={styles.phoneDelivery}>
          <Icon name="pin" size={16} />
          Sign in to choose where to deliver
        </Link>
      ) : (
        <button
          type="button"
          className={styles.phoneDelivery}
          aria-haspopup="dialog"
          onClick={() => setIsChoosingLocation(true)}
        >
          <Icon name="pin" size={16} />
          Delivering to {deliveryLocationLabel(shopper)}
        </button>
      )}
      {shopper !== null && (
        <LocationDialog isOpen={isChoosingLocation} onClose={() => setIsChoosingLocation(false)} />
      )}
    </header>
  );
}
