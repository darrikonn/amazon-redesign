"use client";

import { useId, useRef, useState } from "react";
import type { Department } from "@/use-case";
import { Collapsible } from "./collapsible";
import styles from "./department-menu.module.css";
import { Icon } from "./icon";
import { useShop } from "./shop-context";
import { useDismissal } from "./use-dismissal";

type DepartmentMenuProps = {
  departments: readonly Department[];
};

export function DepartmentMenu({ departments }: DepartmentMenuProps) {
  const { search } = useShop();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useDismissal(isOpen, containerRef, () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  });

  function pick(query: string) {
    setIsOpen(false);
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
        onClick={() => setIsOpen((open) => !open)}
      >
        <Icon name="menu" size={22} strokeWidth={2.2} />
      </button>
      <nav id={panelId} aria-label="Departments" className={styles.panel} hidden={!isOpen}>
        <p className={styles.heading}>Shop by department</p>
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
        <button type="button" className={styles.item} onClick={() => onPick(department.query)}>
          {department.label}
        </button>
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
              <button
                type="button"
                className={styles.group}
                onClick={() => onPick(department.query)}
              >
                All {department.label.toLowerCase()}
                <span className={styles.count}>{department.productCount}</span>
              </button>
            </li>
            {department.groups.map((group) => (
              <li key={group.query}>
                <button type="button" className={styles.group} onClick={() => onPick(group.query)}>
                  {group.label}
                  <span className={styles.count}>{group.productCount}</span>
                </button>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}
    </li>
  );
}
