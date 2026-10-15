"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import styles from "./account-menu.module.css";
import { deliveryLocationLabel } from "./format";
import { Icon } from "./icon";
import { useShop } from "./shop-context";
import { signInHref } from "./sign-in-href";
import { useCurrentAddress } from "./use-current-address";
import { useDismissal } from "./use-dismissal";

type AccountMenuProps = {
  onChangeLocation: () => void;
};

const ACCOUNT_LINKS = [
  { href: "/account", label: "Your account" },
  { href: "/orders", label: "Your orders and returns" },
  { href: "/buy-again", label: "Buy again" },
  { href: "/lists", label: "Your lists" },
  { href: "/deals", label: "Today's deals" },
] as const;

// One header item for who is shopping and where it goes: the greeting above the delivery
// location, since the location decides what can be delivered. It opens the account's
// places, the location to change, and signing in or out.
export function AccountMenu({ onChangeLocation }: AccountMenuProps) {
  const { shopper, signOut } = useShop();
  const signIn = signInHref(useCurrentAddress());
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useDismissal(isOpen, containerRef, () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  });
  const location = shopper === null ? null : deliveryLocationLabel(shopper);

  function close() {
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={styles.menu}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={
          shopper === null
            ? "Account and lists, signed out"
            : `Account and lists for ${shopper.firstName}, delivering to ${location}`
        }
        onClick={() => setIsOpen((open) => !open)}
      >
        {shopper !== null && <Icon name="pin" size={20} className={styles.pin} />}
        <span className={styles.stacked}>
          <span className={styles.eyebrow}>
            {shopper === null ? "Hello, sign in" : `Hello, ${shopper.firstName}`}
          </span>
          <span className={styles.strong}>{shopper === null ? "Account & Lists" : location}</span>
        </span>
        <span className={styles.compact}>{shopper === null ? "Sign in" : shopper.firstName}</span>
        <Icon name="chevron-right" size={14} strokeWidth={2.6} className={styles.caret} />
      </button>
      <div id={panelId} className={styles.panel} hidden={!isOpen}>
        {shopper === null ? (
          <div className={styles.signIn}>
            <Link href={signIn} className={styles.signInButton} onClick={close}>
              Sign in
            </Link>
            <p className={styles.note}>Sign in with any email to choose where your orders go.</p>
          </div>
        ) : (
          <div className={styles.location}>
            <Icon name="pin" size={18} />
            <span className={styles.locationText}>
              <span className={styles.locationLabel}>Delivering to</span>
              <span className={styles.locationValue}>{location}</span>
            </span>
            <button
              type="button"
              className={styles.change}
              onClick={() => {
                close();
                onChangeLocation();
              }}
            >
              Change
            </button>
          </div>
        )}
        <nav aria-label="Your account">
          <ul className={styles.links}>
            {ACCOUNT_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.link} onClick={close}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {shopper !== null && (
          <button
            type="button"
            className={styles.signOut}
            onClick={() => {
              close();
              signOut().catch(reportError);
            }}
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}
