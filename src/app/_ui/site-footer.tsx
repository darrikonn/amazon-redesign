import Link from "next/link";
import { AmazonLogo } from "./amazon-logo";
import { helpHref, SHOP_PLACES, type ShopPlace } from "./shop-place";
import styles from "./site-footer.module.css";

type FooterColumn = {
  heading: string;
  links: readonly { label: string; href: string }[];
};

function linkTo(place: ShopPlace) {
  return { label: place.title, href: place.href };
}

const COLUMNS: readonly FooterColumn[] = [
  {
    heading: "Shop",
    links: [linkTo(SHOP_PLACES.deals), linkTo(SHOP_PLACES.buyAgain), linkTo(SHOP_PLACES.cart)],
  },
  {
    heading: "Your account",
    links: [
      linkTo(SHOP_PLACES.account),
      linkTo(SHOP_PLACES.orders),
      linkTo(SHOP_PLACES.trackOrder),
      linkTo(SHOP_PLACES.list),
    ],
  },
  {
    heading: "Help",
    links: [
      { label: "All help topics", href: SHOP_PLACES.help.href },
      { label: "Delivery", href: helpHref("delivery") },
      { label: "Returns", href: helpHref("returns") },
      { label: "Accessibility", href: helpHref("accessibility") },
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
            {column.links.map((link) => (
              <Link key={link.label} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
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
