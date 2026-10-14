import Link from "next/link";
import type { MouseEvent } from "react";
import type { NavigationLinkView, NavigationView } from "@/use-case";
import styles from "./browse-navigation.module.css";
import { searchUrl } from "./search-url";

type BrowseNavigationProps = {
  navigation: NavigationView;
  onSearch: (text: string) => void;
};

export function BrowseNavigation({ navigation, onSearch }: BrowseNavigationProps) {
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
  onSearch: (text: string) => void;
  isHeading?: boolean;
};

// A real link, so it can open in a new tab, but a plain click searches in place instead
// of reloading the page.
function BrowseLink({ link, onSearch, isHeading = false }: BrowseLinkProps) {
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    onSearch(link.text);
  }

  return (
    <Link
      href={searchUrl({ text: link.text, sort: "best-match" })}
      className={isHeading ? styles.heading : link.isCurrent ? styles.currentLink : styles.link}
      aria-current={link.isCurrent ? "page" : undefined}
      onClick={navigate}
    >
      <span className={styles.label}>{link.label}</span>
      <span className={styles.count}>{link.productCount.toLocaleString("en-US")}</span>
    </Link>
  );
}
