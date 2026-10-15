import type { ReactNode } from "react";
import styles from "./empty-state.module.css";
import { Icon, type IconName } from "./icon";
import page from "./shop-page.module.css";

type EmptyStateProps = {
  icon: IconName;
  title: string;
  message?: string;
  children: ReactNode;
};

// What a page shows when it has nothing to list, with where to go next.
export function EmptyState({ icon, title, message, children }: EmptyStateProps) {
  return (
    <div className={`${page.panel} ${styles.empty}`}>
      <span className={styles.iconTile}>
        <Icon name={icon} size={24} />
      </span>
      <h2 className={styles.title}>{title}</h2>
      {message !== undefined && <p className={page.muted}>{message}</p>}
      <div className={styles.actions}>{children}</div>
    </div>
  );
}
