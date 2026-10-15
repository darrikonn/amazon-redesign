"use client";

import Link from "next/link";
import { type ReactNode, useId, useState } from "react";
import type { Department } from "@/use-case";
import { useBrowsing } from "./browsing-context";
import { Collapsible } from "./collapsible";
import styles from "./department-menu.module.css";
import { Icon } from "./icon";
import { isPlainClick } from "./plain-click";
import { DEFAULT_SORT, searchUrl } from "./search-url";
import { useDisclosure } from "./use-disclosure";

type DepartmentMenuProps = {
  departments: readonly Department[];
};

export function DepartmentMenu({ departments }: DepartmentMenuProps) {
  const { search } = useBrowsing();
  const { isOpen, toggle, close, panelId, containerRef, toggleRef } = useDisclosure();

  function dismiss() {
    close();
    toggleRef.current?.focus();
  }

  function pick(query: string) {
    close();
    search(query);
  }

  return (
    <div ref={containerRef} className={styles.menu}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-label="All departments"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={toggle}
      >
        <Icon name="menu" size={22} strokeWidth={2.2} />
      </button>
      {isOpen && <div className={styles.scrim} aria-hidden="true" onClick={dismiss} />}
      <nav id={panelId} aria-label="Departments" className={styles.panel} hidden={!isOpen}>
        <div className={styles.panelHeader}>
          <p className={styles.heading}>Shop by department</p>
          <button
            type="button"
            className={styles.close}
            aria-label="Close departments"
            onClick={dismiss}
          >
            <Icon name="close" size={18} strokeWidth={2.6} />
          </button>
        </div>
        <ul>
          {departments.map((department) => (
            <DepartmentEntry key={department.query} department={department} onPick={pick} />
          ))}
        </ul>
      </nav>
    </div>
  );
}

type DepartmentEntryProps = {
  department: Department;
  onPick: (query: string) => void;
};

// The name searches the department; the arrow only opens its sub-groups, so a shopper
// can look inside before going anywhere.
function DepartmentEntry({ department, onPick }: DepartmentEntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const groupsId = useId();
  const hasGroups = department.groups.length > 0;
  return (
    <li>
      <div className={styles.row}>
        <SearchLink query={department.query} className={styles.item} onPick={onPick}>
          {department.label}
        </SearchLink>
        {hasGroups && (
          <button
            type="button"
            className={isExpanded ? styles.expandOpen : styles.expand}
            aria-label={`${department.label} categories`}
            aria-expanded={isExpanded}
            aria-controls={groupsId}
            onClick={() => setIsExpanded((expanded) => !expanded)}
          >
            <Icon name="chevron-right" size={16} strokeWidth={2.4} />
          </button>
        )}
      </div>
      {hasGroups && (
        <Collapsible isOpen={isExpanded}>
          <ul id={groupsId} className={styles.groups}>
            <li>
              <SearchLink query={department.query} className={styles.group} onPick={onPick}>
                All {department.label.toLowerCase()}
                <span className={styles.count}>{department.productCount}</span>
              </SearchLink>
            </li>
            {department.groups.map((group) => (
              <li key={group.query}>
                <SearchLink query={group.query} className={styles.group} onPick={onPick}>
                  {group.label}
                  <span className={styles.count}>{group.productCount}</span>
                </SearchLink>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}
    </li>
  );
}

type SearchLinkProps = {
  query: string;
  className: string | undefined;
  onPick: (query: string) => void;
  children: ReactNode;
};

// A real link, so it opens in a new tab; a plain click searches in place instead.
function SearchLink({ query, className, onPick, children }: SearchLinkProps) {
  return (
    <Link
      href={searchUrl({ text: query, sort: DEFAULT_SORT })}
      prefetch={false}
      className={className}
      onClick={(event) => {
        if (!isPlainClick(event)) return;
        event.preventDefault();
        onPick(query);
      }}
    >
      {children}
    </Link>
  );
}
