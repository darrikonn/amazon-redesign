import { splitPrice } from "./format";
import styles from "./price.module.css";

export function Price({ priceInCents }: { priceInCents: number }) {
  const price = splitPrice(priceInCents);
  return (
    <p className={styles.price}>
      <span className="visually-hidden">{price.spoken}</span>
      <span className={styles.symbol} aria-hidden="true">
        $
      </span>
      <span className={styles.dollars} aria-hidden="true">
        {price.dollars}
      </span>
      <span className={styles.cents} aria-hidden="true">
        {price.cents}
      </span>
    </p>
  );
}
