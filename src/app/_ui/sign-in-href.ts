// On the sign-in page itself the link keeps the page as it is, return path included.
export function signInHref(returnPath: string): string {
  if (returnPath.startsWith("/sign-in")) return returnPath;
  if (returnPath === "/") return "/sign-in";
  return `/sign-in?next=${encodeURIComponent(returnPath)}`;
}

// Only a path on this site is followed after sign-in. The value is resolved the way a
// browser would, and both it and the path that comes out must stay on this origin: that
// catches "/\evil.com" and "/<tab>/evil.com", and dot segments ("/.//evil.com") that
// resolve to a path starting with "//", which a browser reads as another site.
export function safeReturnPath(next: string | null | undefined): string {
  if (next === null || next === undefined || !next.startsWith("/")) return "/";
  const path = sameSitePath(next);
  return path !== null && sameSitePath(path) === path ? path : "/";
}

function sameSitePath(address: string): string | null {
  try {
    const resolved = new URL(address, THIS_SITE);
    if (resolved.origin !== THIS_SITE) return null;
    const path = `${resolved.pathname}${resolved.search}${resolved.hash}`;
    return path.startsWith("//") || path.startsWith("/\\") ? null : path;
  } catch {
    return null;
  }
}

// Any origin works for resolving: only whether the result stays on it matters.
const THIS_SITE = "https://shop.invalid";
