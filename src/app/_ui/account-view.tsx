"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./account-view.module.css";
import { deliveryLocationLabel } from "./format";
import { Icon, type IconName } from "./icon";
import { LocationDialog } from "./location-dialog";
import { useShop } from "./shop-context";
import page from "./shop-page.module.css";

type AccountCard = {
  href: string;
  icon: IconName;
  title: string;
  description: string;
};

const CARDS: readonly AccountCard[] = [
  {
    href: "/orders",
    icon: "package",
    title: "Your orders",
    description: "Track, return, or buy again",
  },
  { href: "/buy-again", icon: "refresh", title: "Buy again", description: "Your regular items" },
  { href: "/lists", icon: "heart", title: "Your list", description: "Products you saved" },
  { href: "/deals", icon: "tag", title: "Today's deals", description: "All in one place" },
  { href: "/cart", icon: "cart", title: "Your cart", description: "Ready when you are" },
];

export function AccountView() {
  const { shopper, signOut } = useShop();
  const [isChoosingLocation, setIsChoosingLocation] = useState(false);
  if (shopper === null) return null;
  const location = deliveryLocationLabel(shopper);

  return (
    <main className={page.main}>
      <div className={page.heading}>
        <div>
          <h1 className={page.title}>Hello, {shopper.fullName}</h1>
          <p className={page.lede}>{shopper.email}</p>
        </div>
        <button
          type="button"
          className={page.secondaryButton}
          onClick={() => {
            signOut().catch(reportError);
          }}
        >
          Sign out
        </button>
      </div>
      <ul className={styles.cards} aria-label="Your account">
        {CARDS.map((card) => (
          <li key={card.href}>
            <Link href={card.href} className={styles.card}>
              <span className={styles.iconTile}>
                <Icon name={card.icon} size={24} />
              </span>
              <span className={styles.text}>
                <span className={styles.cardTitle}>{card.title}</span>
                <span className={styles.description}>{card.description}</span>
              </span>
            </Link>
          </li>
        ))}
        <li>
          <button type="button" className={styles.card} onClick={() => setIsChoosingLocation(true)}>
            <span className={styles.iconTile}>
              <Icon name="pin" size={24} />
            </span>
            <span className={styles.text}>
              <span className={styles.cardTitle}>Delivery location</span>
              <span className={styles.description}>{location}</span>
            </span>
          </button>
        </li>
      </ul>
      <LocationDialog isOpen={isChoosingLocation} onClose={() => setIsChoosingLocation(false)} />
    </main>
  );
}
