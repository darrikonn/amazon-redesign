import Link from "next/link";
import { AmazonLogo } from "./amazon-logo";
import styles from "./site-footer.module.css";

type FooterColumn = {
  heading: string;
  links: readonly { label: string; href: string }[];
};

const COLUMNS: readonly FooterColumn[] = [
  {
    heading: "Shop",
    links: [
      { label: "Today's Deals", href: "/deals" },
      { label: "Buy Again", href: "/buy-again" },
      { label: "Gift Cards", href: "#gift-cards" },
      { label: "Registry", href: "#registry" },
    ],
  },
  {
    heading: "Your account",
    links: [
      { label: "Your Orders", href: "/orders" },
      { label: "Returns", href: "/orders" },
      { label: "Your Lists", href: "/lists" },
      { label: "Prime", href: "#prime" },
    ],
  },
  {
    heading: "More from Amazon",
    links: [
      { label: "Prime Video", href: "#prime-video" },
      { label: "Amazon Music", href: "#amazon-music" },
      { label: "Groceries", href: "#groceries" },
      { label: "Pharmacy", href: "#pharmacy" },
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "Customer Service", href: "#customer-service" },
      { label: "Shipping Rates", href: "#shipping-rates" },
      { label: "Accessibility", href: "#accessibility" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.columns}>
        {COLUMNS.map((column) => (
          <nav key={column.heading} aria-label={column.heading} className={styles.column}>
            <p className={styles.heading}>{column.heading}</p>
            {column.links.map((link) =>
              link.href.startsWith("/") ? (
                <Link key={link.label} href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              ) : (
                <a key={link.label} href={link.href} className={styles.link}>
                  {link.label}
                </a>
              ),
            )}
          </nav>
        ))}
      </div>
      <div className={styles.legal}>
        <p className={styles.copyright}>
          <span className={styles.wordmark}>
            <AmazonLogo />
          </span>
          © 1996-2026, Amazon.com, Inc. or its affiliates
        </p>
        <p>English · United States · USD</p>
      </div>
    </footer>
  );
}
