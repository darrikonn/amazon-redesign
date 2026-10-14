"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type MouseEvent, useState } from "react";
import type { Department } from "@/use-case";
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
      <nav aria-label="Account and cart" className={styles.navigation}>
        {shopper === null ? (
          <Link href={signIn} className={styles.wideLink}>
            <Icon name="pin" size={20} />
            <Stacked eyebrow="Deliver to" strong="Sign in to choose" />
          </Link>
        ) : (
          <button
            type="button"
            className={styles.wideLink}
            aria-haspopup="dialog"
            onClick={() => setIsChoosingLocation(true)}
          >
            <Icon name="pin" size={20} />
            <Stacked
              eyebrow={`Deliver to ${shopper.firstName}`}
              strong={[shopper.deliveryCity, shopper.deliveryPostalCode].filter(Boolean).join(" ")}
            />
          </button>
        )}
        <Link href={shopper === null ? signIn : "/account"} className={styles.wideLink}>
          <Stacked
            eyebrow={shopper === null ? "Hello, sign in" : `Hello, ${shopper.firstName}`}
            strong="Account & Lists"
          />
        </Link>
        <Link href="/orders" className={styles.wideLink}>
          <Stacked eyebrow="Returns" strong="& Orders" />
        </Link>
        <Link href={shopper === null ? signIn : "/account"} className={styles.phoneAccount}>
          <span className={styles.phoneAccountName}>
            {shopper === null ? "Sign in" : shopper.firstName}
          </span>
          <Icon name="chevron-right" size={14} strokeWidth={2.6} />
        </Link>
        <Link
          href="/cart"
          className={styles.cartLink}
          aria-label={`Cart, ${pluralize(cart.itemCount, "item", "items")}`}
        >
          <Icon name="cart" size={24} />
          <span className={styles.cartWord}>Cart</span>
          <span className={styles.cartCount}>{cart.itemCount}</span>
        </Link>
      </nav>
      {shopper === null ? (
        <Link href={signIn} className={styles.phoneDelivery}>
          <Icon name="pin" size={16} />
          Deliver to: sign in to choose a location
        </Link>
      ) : (
        <button
          type="button"
          className={styles.phoneDelivery}
          aria-haspopup="dialog"
          onClick={() => setIsChoosingLocation(true)}
        >
          <Icon name="pin" size={16} />
          Deliver to {shopper.firstName},{" "}
          {[shopper.deliveryCity, shopper.deliveryPostalCode].filter(Boolean).join(" ")}
        </button>
      )}
      {shopper !== null && (
        <LocationDialog isOpen={isChoosingLocation} onClose={() => setIsChoosingLocation(false)} />
      )}
    </header>
  );
}

function Stacked({ eyebrow, strong }: { eyebrow: string; strong: string }) {
  return (
    <span className={styles.stacked}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <span className={styles.strong}>{strong}</span>
    </span>
  );
}
