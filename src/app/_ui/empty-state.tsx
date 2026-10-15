import type { ReactNode } from "react";
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
    <div className={`${page.panel} ${page.emptyState}`}>
      <span className={page.emptyIconTile}>
        <Icon name={icon} size={24} />
      </span>
      <h2 className={page.emptyTitle}>{title}</h2>
      {message !== undefined && <p className={page.muted}>{message}</p>}
      <div className={page.emptyActions}>{children}</div>
    </div>
  );
}
