import { PlaceTile } from "./place-tile";
import { SHOP_PLACES } from "./shop-place";
import styles from "./shortcut-list.module.css";

const SHORTCUTS = [SHOP_PLACES.buyAgain, SHOP_PLACES.trackOrder, SHOP_PLACES.deals];

export function ShortcutList() {
  return (
    <ul className={styles.list} aria-label="Shortcuts">
      {SHORTCUTS.map((place) => (
        <li key={place.href}>
          <PlaceTile {...place} />
        </li>
      ))}
    </ul>
  );
}
