import Link from "next/link";
import { type MouseEvent, type RefObject, useEffect, useId, useRef, useState } from "react";
import type { SearchSort } from "@/core";
import type { NavigationDepartmentView, NavigationLinkView, NavigationView } from "@/use-case";
import styles from "./browse-navigation.module.css";
import { Collapsible } from "./collapsible";
import { Icon } from "./icon";
import { scrollToTop } from "./motion";
import { searchUrl } from "./search-url";

type BrowseNavigationProps = {
  navigation: NavigationView;
  sort: SearchSort;
  onBrowse: (text: string) => void;
};

// The department holding the results opens by itself; any department can be opened or
// closed by hand, and that choice is kept while the shopper clicks through the panel.
export function BrowseNavigation({ navigation, sort, onBrowse }: BrowseNavigationProps) {
  const [openedByHand, setOpenedByHand] = useState<ReadonlyMap<string, boolean>>(new Map());
  const listRef = useRef<HTMLUListElement>(null);
  const resultDepartment = navigation.departments.find((department) => department.containsResults);
  useRevealResultDepartment(listRef, resultDepartment?.link.text ?? null);

  function isOpen(department: NavigationDepartmentView): boolean {
    return openedByHand.get(department.link.text) ?? department.containsResults;
  }

  function toggle(department: NavigationDepartmentView) {
    const next = !isOpen(department);
    setOpenedByHand((current) => new Map(current).set(department.link.text, next));
  }

  function browse(link: NavigationLinkView) {
    onBrowse(link.text);
    scrollToTop();
  }

  return (
    <nav aria-label="Departments" className={styles.navigation}>
      <h2 className={styles.sectionHeading}>Departments</h2>
      <ul ref={listRef} className={styles.departments}>
        {navigation.departments.map((department) => (
          <DepartmentItem
            key={department.link.text}
            department={department}
            sort={sort}
            isOpen={isOpen(department)}
            onToggle={() => toggle(department)}
            onBrowse={browse}
          />
        ))}
      </ul>
    </nav>
  );
}

// On desktop the list scrolls inside the sticky panel; the department holding the results
// is brought into view there, without moving the page.
function useRevealResultDepartment(
  listRef: RefObject<HTMLUListElement | null>,
  departmentText: string | null,
) {
  useEffect(() => {
    const list = listRef.current;
    if (list === null || departmentText === null) return;
    const item = list.querySelector<HTMLElement>("[data-contains-results]");
    if (item === null) return;
    const isAbove = item.offsetTop < list.scrollTop;
    const isBelow = item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight;
    if (isAbove || isBelow) list.scrollTop = item.offsetTop - REVEAL_MARGIN_IN_PIXELS;
  }, [listRef, departmentText]);
}

const REVEAL_MARGIN_IN_PIXELS = 12;

type DepartmentItemProps = {
  department: NavigationDepartmentView;
  sort: SearchSort;
  isOpen: boolean;
  onToggle: () => void;
  onBrowse: (link: NavigationLinkView) => void;
};

function DepartmentItem({ department, sort, isOpen, onToggle, onBrowse }: DepartmentItemProps) {
  const groupsId = useId();
  const { link, containsResults, groups } = department;
  return (
    <li data-contains-results={containsResults || undefined}>
      <div className={styles.departmentRow}>
        <BrowseLink
          link={link}
          sort={sort}
          className={containsResults ? styles.resultDepartment : styles.department}
          isInResultDepartment={containsResults}
          onBrowse={onBrowse}
        />
        {groups.length > 0 && (
          <button
            type="button"
            className={isOpen ? styles.toggleOpen : styles.toggle}
            aria-expanded={isOpen}
            aria-controls={groupsId}
            aria-label={`${link.label} sub-groups`}
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
                  isInResultDepartment={false}
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
  isInResultDepartment: boolean;
  onBrowse: (link: NavigationLinkView) => void;
};

// A real link, so it can open in a new tab, but a plain click searches in place instead
// of reloading the page.
function BrowseLink({ link, sort, className, isInResultDepartment, onBrowse }: BrowseLinkProps) {
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    event.preventDefault();
    onBrowse(link);
  }

  return (
    <Link
      href={searchUrl({ text: link.text, sort })}
      className={className}
      aria-current={currentMarker(link, isInResultDepartment)}
      onClick={navigate}
    >
      <span className={styles.label}>{link.label}</span>
      <span className={styles.count}>{link.productCount.toLocaleString("en-US")}</span>
    </Link>
  );
}

// "page" when the search is exactly this entry; "true" for the department the results
// belong to, so screen readers hear where the shopper is even on a narrower search.
function currentMarker(link: NavigationLinkView, isInResultDepartment: boolean) {
  if (link.isCurrent) return "page";
  return isInResultDepartment ? "true" : undefined;
}
