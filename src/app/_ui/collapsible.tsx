import type { ReactNode } from "react";
import styles from "./collapsible.module.css";

// Shrinks its content to nothing instead of removing it, so what sits below slides into
// place rather than jumping. Closed content is inert: not focusable, not announced.
export function Collapsible({ isOpen, children }: { isOpen: boolean; children: ReactNode }) {
  return (
    <div className={isOpen ? styles.open : styles.closed} inert={!isOpen}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
