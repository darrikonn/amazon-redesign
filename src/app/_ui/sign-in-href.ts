// Sign-in comes back to where the shopper was.
export function signInHref(returnPath: string): string {
  if (returnPath === "/" || returnPath.startsWith("/sign-in")) return "/sign-in";
  return `/sign-in?next=${encodeURIComponent(returnPath)}`;
}

// Only a path on this site is followed after sign-in, never another site's address.
export function safeReturnPath(next: string | null | undefined): string {
  if (next === null || next === undefined || !next.startsWith("/") || next.startsWith("//")) {
    return "/";
  }
  return next;
}
