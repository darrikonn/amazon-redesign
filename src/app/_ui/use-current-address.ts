import { usePathname, useSearchParams } from "next/navigation";

// The page's path with its query, so a link to sign-in can come back to the exact search.
export function useCurrentAddress(): string {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  return query === "" ? pathname : `${pathname}?${query}`;
}
