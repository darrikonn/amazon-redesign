import Link from "next/link";
import type { Department, ShopperGreeting } from "@/use-case";
import { DepartmentMenu } from "./department-menu";
import { Icon } from "./icon";
import styles from "./site-header.module.css";

type SiteHeaderProps = {
  shopper: ShopperGreeting;
  departments: readonly Department[];
  cartCount: number;
  onSearch: (text: string) => void;
};

export function SiteHeader({ shopper, departments, cartCount, onSearch }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <DepartmentMenu departments={departments} onPick={onSearch} />
        <Link href="/" className={styles.logo} onClick={() => onSearch("")}>
          amazon
        </Link>
      </div>
      <nav aria-label="Your account" className={styles.navigation}>
        <a href="#deliver" className={styles.wideLink}>
          <Icon name="pin" size={20} />
          <span className={styles.stacked}>
            <span className={styles.eyebrow}>Deliver to {shopper.firstName}</span>
            <span className={styles.strong}>
              {shopper.deliveryCity} {shopper.deliveryPostalCode}
            </span>
          </span>
        </a>
        <a href="#account" className={styles.wideLink}>
          <span className={styles.stacked}>
            <span className={styles.eyebrow}>Hello, {shopper.firstName}</span>
            <span className={styles.strong}>Account &amp; Lists</span>
          </span>
        </a>
        <a href="#orders" className={styles.wideLink}>
          <span className={styles.stacked}>
            <span className={styles.eyebrow}>Returns</span>
            <span className={styles.strong}>&amp; Orders</span>
          </span>
        </a>
        <a
          href="#cart"
          className={styles.cartLink}
          aria-label={`Cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
        >
          <Icon name="cart" size={24} />
          Cart
          <span className={styles.cartCount}>{cartCount}</span>
        </a>
      </nav>
    </header>
  );
}
