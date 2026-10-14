import Link from "next/link";
import { Icon, type IconName } from "./icon";
import styles from "./shortcut-list.module.css";

type Shortcut = {
  href: string;
  icon: IconName;
  title: string;
  description: string;
};

const SHORTCUTS: readonly Shortcut[] = [
  { href: "/buy-again", icon: "refresh", title: "Buy again", description: "Your regular items" },
  {
    href: "/orders?show=on-the-way",
    icon: "package",
    title: "Track an order",
    description: "Deliveries and returns",
  },
  { href: "/deals", icon: "tag", title: "Today's deals", description: "All in one place" },
];

export function ShortcutList() {
  return (
    <ul className={styles.list} aria-label="Shortcuts">
      {SHORTCUTS.map((shortcut) => (
        <li key={shortcut.href}>
          <Link href={shortcut.href} className={styles.card}>
            <span className={styles.iconTile}>
              <Icon name={shortcut.icon} size={24} />
            </span>
            <span className={styles.text}>
              <span className={styles.title}>{shortcut.title}</span>
              <span className={styles.description}>{shortcut.description}</span>
            </span>
            <Icon name="chevron-right" size={18} strokeWidth={2.4} className={styles.chevron} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
