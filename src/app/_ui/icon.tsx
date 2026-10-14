import type { ReactNode } from "react";

export type IconName =
  | "menu"
  | "pin"
  | "cart"
  | "search"
  | "arrow-right"
  | "close"
  | "plus"
  | "check"
  | "refresh"
  | "package"
  | "tag"
  | "chevron-right"
  | "add-to-cart";

type IconProps = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string | undefined;
};

export function Icon({ name, size = 24, strokeWidth = 2, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}

const PATHS: Record<IconName, ReactNode> = {
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  cart: (
    <>
      <path d="M2.5 4h3l2.6 11.5h10.4l2.5-8.5H7" />
      <circle cx="9.5" cy="19.5" r="1.5" />
      <circle cx="17" cy="19.5" r="1.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.5 16.5 21 21" />
    </>
  ),
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.7-6" />
      <path d="M20 4v5h-5" />
    </>
  ),
  package: (
    <>
      <path d="M12 3 4 7v10l8 4 8-4V7z" />
      <path d="M4 7l8 4 8-4M12 11v10" />
    </>
  ),
  tag: (
    <>
      <path d="M12.5 3H4v8.5l9 9.5 8.5-8.5z" />
      <circle cx="8.5" cy="7.5" r="1.5" />
    </>
  ),
  "chevron-right": <path d="M9 5l7 7-7 7" />,
  "add-to-cart": (
    <>
      <path d="M2.5 5h2.5l2.4 10.5h9.6l2-7" />
      <circle cx="9" cy="19.5" r="1.4" />
      <circle cx="16.5" cy="19.5" r="1.4" />
      <path d="M13 3v7M9.5 6.5h7" />
    </>
  ),
};
