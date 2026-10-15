import { useSyncExternalStore } from "react";

// The width at which the layouts switch to their phone forms, as the CSS modules write it.
export const PHONE_MEDIA = "(max-width: 760px)";

// Whether the media query matches now; false while rendering on the server.
export function useMatchesMedia(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
