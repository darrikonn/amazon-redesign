import Link from "next/link";
import type { MouseEvent } from "react";
import type { NavigationLinkView, NavigationView } from "@/use-case";
import styles from "./browse-navigation.module.css";
import { searchUrl } from "./search-url";

type BrowseNavigationProps = {
  navigation: NavigationView;
  onBrowse: (text: string) => void;
  onNarrow: (text: string) => void;
};

export function BrowseNavigation({ navigation, onBrowse, onNarrow }: BrowseNavigationProps) {
  // Fixed destinations go where they say even mid-search; links that add to the current
  // search must not discard newer typing, so they go through the pending-search guard.
  const onSearch = (link: NavigationLinkView) =>
    (link.narrowsSearch ? onNarrow : onBrowse)(link.text);
  return (
    <nav aria-label="Browse" className={styles.navigation}>
      {navigation.heading === null ? (
        <h2 className={styles.sectionHeading}>{navigation.headingLabel}</h2>
      ) : (
        <BrowseLink link={navigation.heading} onSearch={onSearch} isHeading />
      )}
      <ul className={styles.list}>
        {navigation.links.map((link) => (
          <li key={link.text}>
            <BrowseLink link={link} onSearch={onSearch} />
          </li>
        ))}
      </ul>
      {navigation.related.length > 0 && (
        <>
          <h2 className={styles.sectionHeading}>Shoppers also browse</h2>
          <ul className={styles.list}>
            {navigation.related.map((link) => (
              <li key={link.text}>
                <BrowseLink link={link} onSearch={onSearch} />
              </li>
            ))}
          </ul>
        </>
      )}
    </nav>
  );
}

type BrowseLinkProps = {
  link: NavigationLinkView;
  onSearch: (link: NavigationLinkView) => void;
  isHeading?: boolean;
};

// A real link, so it can open in a new tab, but a plain click searches in place instead
// of reloading the page, then returns to the top so the new results start in view.
function BrowseLink({ link, onSearch, isHeading = false }: BrowseLinkProps) {
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    onSearch(link);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }

  return (
    <Link
      href={searchUrl({ text: link.text, sort: "best-match" })}
      className={linkClassName(link, isHeading)}
      aria-current={link.isCurrent ? "page" : undefined}
      onClick={navigate}
    >
      <span className={styles.label}>{link.label}</span>
      <span className={styles.count}>{link.productCount.toLocaleString("en-US")}</span>
    </Link>
  );
}

function linkClassName(link: NavigationLinkView, isHeading: boolean): string | undefined {
  if (isHeading) return styles.heading;
  return link.isCurrent ? styles.currentLink : styles.link;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
