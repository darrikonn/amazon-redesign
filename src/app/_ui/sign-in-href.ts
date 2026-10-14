export function signInHref(returnPath: string): string {
  if (returnPath === "/" || returnPath.startsWith("/sign-in")) return "/sign-in";
  return `/sign-in?next=${encodeURIComponent(returnPath)}`;
}

// Only a path on this site is followed after sign-in. The value is resolved the way a
// browser would and must stay on this origin, which also catches "/\evil.com" and
// "/<tab>/evil.com", both of which browsers treat as another site.
export function safeReturnPath(next: string | null | undefined): string {
  if (next === null || next === undefined || !next.startsWith("/")) return "/";
  try {
    const resolved = new URL(next, THIS_SITE);
    if (resolved.origin !== THIS_SITE) return "/";
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return "/";
  }
}

// Any origin works for resolving: only whether the result stays on it matters.
const THIS_SITE = "https://shop.invalid";
