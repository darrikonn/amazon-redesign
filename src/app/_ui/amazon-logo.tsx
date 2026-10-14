import styles from "./amazon-logo.module.css";

// The wordmark with its smile: an arrow from the a to the z.
export function AmazonLogo() {
  return (
    <span className={styles.logo}>
      <span className={styles.wordmark}>amazon</span>
      <svg className={styles.smile} viewBox="0 0 100 20" aria-hidden="true" focusable="false">
        <path d="M4 5 Q 48 22 90 6" />
        <path d="M82 3 L 91 6 L 85 13" />
      </svg>
    </span>
  );
}
