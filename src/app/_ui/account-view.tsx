"use client";

import { useState } from "react";
import styles from "./account-view.module.css";
import { deliveryLocationLabel } from "./format";
import { LocationDialog } from "./location-dialog";
import { PlaceTile } from "./place-tile";
import { useSession } from "./session-context";
import page from "./shop-page.module.css";
import { SHOP_PLACES } from "./shop-place";

const PLACES = [
  SHOP_PLACES.orders,
  SHOP_PLACES.buyAgain,
  SHOP_PLACES.list,
  SHOP_PLACES.deals,
  SHOP_PLACES.cart,
];

export function AccountView() {
  const { shopper, signOut } = useSession();
  const [isChoosingLocation, setIsChoosingLocation] = useState(false);
  if (shopper === null) return null;

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
      <ul className={styles.tiles} aria-label="Your account">
        {PLACES.map((place) => (
          <li key={place.href}>
            <PlaceTile {...place} />
          </li>
        ))}
        <li>
          <PlaceTile
            icon="pin"
            title="Delivery location"
            description={deliveryLocationLabel(shopper)}
            onClick={() => setIsChoosingLocation(true)}
          />
        </li>
      </ul>
      <LocationDialog isOpen={isChoosingLocation} onClose={() => setIsChoosingLocation(false)} />
    </main>
  );
}
