import Link from "next/link";
import { type MouseEvent, useId, useState } from "react";
import type { SearchSort } from "@/core";
import type { NavigationDepartmentView, NavigationLinkView, NavigationView } from "@/use-case";
import styles from "./browse-navigation.module.css";
import { Collapsible } from "./collapsible";
import { Icon } from "./icon";
import { searchUrl } from "./search-url";

type BrowseNavigationProps = {
  navigation: NavigationView;
  sort: SearchSort;
  onBrowse: (text: string, anchor: HTMLElement) => void;
};

// Departments open, and nothing closes by itself: the department the results move into
// opens, and the one they left stays open, so an entry never slides away from the
// pointer. Only the shopper's own toggle closes a department.
export function BrowseNavigation({ navigation, sort, onBrowse }: BrowseNavigationProps) {
  const markedText =
    navigation.departments.find((department) => department.containsResults)?.link.text ?? null;
  const [openState, setOpenState] = useState<ReadonlyMap<string, boolean>>(new Map());
  const [lastMarkedText, setLastMarkedText] = useState(markedText);
  if (markedText !== lastMarkedText) {
    setLastMarkedText(markedText);
    setOpenState((current) => withOpen(current, [lastMarkedText, markedText]));
  }

  function isOpen(department: NavigationDepartmentView): boolean {
    return openState.get(department.link.text) ?? department.containsResults;
  }

  function toggle(department: NavigationDepartmentView) {
    const next = !isOpen(department);
    setOpenState((current) => new Map(current).set(department.link.text, next));
  }

  return (
    <nav aria-label="Shop by department" className={styles.navigation}>
      <h2 className={styles.sectionHeading}>Departments</h2>
      <ul className={styles.departments}>
        {navigation.departments.map((department) => (
          <DepartmentItem
            key={department.link.text}
            department={department}
            sort={sort}
            isOpen={isOpen(department)}
            onToggle={() => toggle(department)}
            onBrowse={onBrowse}
          />
        ))}
      </ul>
    </nav>
  );
}

function withOpen(
  openState: ReadonlyMap<string, boolean>,
  departmentTexts: readonly (string | null)[],
): ReadonlyMap<string, boolean> {
  const next = new Map(openState);
  for (const text of departmentTexts) if (text !== null) next.set(text, true);
  return next;
}

type DepartmentItemProps = {
  department: NavigationDepartmentView;
  sort: SearchSort;
  isOpen: boolean;
  onToggle: () => void;
  onBrowse: (text: string, anchor: HTMLElement) => void;
};

function DepartmentItem({ department, sort, isOpen, onToggle, onBrowse }: DepartmentItemProps) {
  const groupsId = useId();
  const { link, containsResults, groups } = department;
  return (
    <li>
      <div className={styles.departmentRow}>
        <BrowseLink
          link={link}
          sort={sort}
          className={containsResults ? styles.resultDepartment : styles.department}
          isResultDepartment={containsResults}
          onBrowse={onBrowse}
        />
        {groups.length > 0 && (
          <button
            type="button"
            className={isOpen ? styles.toggleOpen : styles.toggle}
            aria-expanded={isOpen}
            aria-controls={groupsId}
            aria-label={`${link.label} categories`}
            onClick={onToggle}
          >
            <Icon name="chevron-right" size={16} strokeWidth={2.6} />
          </button>
        )}
      </div>
      {groups.length > 0 && (
        <Collapsible isOpen={isOpen}>
          <ul id={groupsId} className={styles.groups}>
            {groups.map((group) => (
              <li key={group.text}>
                <BrowseLink
                  link={group}
                  sort={sort}
                  className={group.isCurrent ? styles.currentGroup : styles.group}
                  isResultDepartment={false}
                  onBrowse={onBrowse}
                />
              </li>
            ))}
          </ul>
        </Collapsible>
      )}
    </li>
  );
}

type BrowseLinkProps = {
  link: NavigationLinkView;
  sort: SearchSort;
  className: string | undefined;
  isResultDepartment: boolean;
  onBrowse: (text: string, anchor: HTMLElement) => void;
};

// A real link, so it can open in a new tab, but a plain click searches in place instead
// of reloading the page.
function BrowseLink({ link, sort, className, isResultDepartment, onBrowse }: BrowseLinkProps) {
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    onBrowse(link.text, event.currentTarget);
  }

  return (
    <Link
      href={searchUrl({ text: link.text, sort })}
      className={className}
      aria-current={currentMarker(link, isResultDepartment)}
      onClick={navigate}
    >
      <span className={styles.label}>{link.label}</span>
      <span className={styles.count}>{link.productCount.toLocaleString("en-US")}</span>
    </Link>
  );
}

// "page" when the search is exactly this entry; "true" for the department the results
// belong to, so screen readers hear where the shopper is even on a narrower search.
function currentMarker(link: NavigationLinkView, isResultDepartment: boolean) {
  if (link.isCurrent) return "page";
  return isResultDepartment ? "true" : undefined;
}
