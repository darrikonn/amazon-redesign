"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useState } from "react";
import type { Department } from "@/use-case";
import { AccountMenu } from "./account-menu";
import { AmazonLogo } from "./amazon-logo";
import { DepartmentMenu } from "./department-menu";
import { pluralize } from "./format";
import { Icon } from "./icon";
import { LocationDialog } from "./location-dialog";
import { isPlainClick } from "./plain-click";
import { useShop } from "./shop-context";
import { signInHref } from "./sign-in-href";
import styles from "./site-header.module.css";
import { useCurrentAddress } from "./use-current-address";

type SiteHeaderProps = {
  departments: readonly Department[];
};

export function SiteHeader({ departments }: SiteHeaderProps) {
  const { shopper, cart, search } = useShop();
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
          href="/cart"
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
          Delivering to{" "}
          {[shopper.deliveryCity, shopper.deliveryPostalCode].filter(Boolean).join(" ")}
        </button>
      )}
      {shopper !== null && (
        <LocationDialog isOpen={isChoosingLocation} onClose={() => setIsChoosingLocation(false)} />
      )}
    </header>
  );
}
