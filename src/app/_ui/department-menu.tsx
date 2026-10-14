"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Department } from "@/use-case";
import styles from "./department-menu.module.css";
import { Icon } from "./icon";

type DepartmentMenuProps = {
  departments: readonly Department[];
  onPick: (query: string) => void;
};

export function DepartmentMenu({ departments, onPick }: DepartmentMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useDismissal(isOpen, containerRef, () => {
    setIsOpen(false);
    toggleRef.current?.focus();
  });

  function pick(department: Department) {
    setIsOpen(false);
    onPick(department.query);
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
            <li key={department.query}>
              <button type="button" className={styles.item} onClick={() => pick(department)}>
                {department.label}
                <Icon name="chevron-right" size={16} strokeWidth={2.4} />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function useDismissal(
  isOpen: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>,
  dismiss: () => void,
) {
  const dismissRef = useRef(dismiss);

  useEffect(() => {
    dismissRef.current = dismiss;
  });

  useEffect(() => {
    if (!isOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) return;
      dismissRef.current();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") dismissRef.current();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, containerRef]);
}
