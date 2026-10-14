import styles from "./amazon-logo.module.css";

// The wordmark with its smile: an arrow from the a to the z.
export function AmazonLogo() {
  return (
    <span className={styles.logo}>
      <span className={styles.wordmark}>amazon</span>
      <svg className={styles.smile} viewBox="0 0 100 24" aria-hidden="true" focusable="false">
        <path d="M3 6 Q 46 26 88 7" />
        <path d="M80 4 Q 88 6 92 8 Q 91 12 89 17" />
      </svg>
    </span>
  );
}
