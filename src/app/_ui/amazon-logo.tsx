import styles from "./amazon-logo.module.css";

// The wordmark with its smile: an arrow from the a to the z.
export function AmazonLogo() {
  return (
    <span className={styles.logo}>
      <span className={styles.wordmark}>amazon</span>
      <svg className={styles.smile} viewBox="0 0 100 24" aria-hidden="true" focusable="false">
        <path className={styles.swoosh} d="M3 5 Q 46 24 88 6 L 88.6 8.6 Q 46 31 2.4 7.8 Z" />
        <path className={styles.arrowhead} d="M80 4 Q 88 6 92 8 Q 91 12 89 17" />
      </svg>
    </span>
  );
}
