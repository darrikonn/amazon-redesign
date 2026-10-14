import type { Session } from "@/core";
import { isRecord } from "@/core";

export const SESSION_COOKIE_NAME = "shop-session";

// A year, so the fake sign-in lasts like a real "keep me signed in".
const MAXIMUM_AGE_IN_SECONDS = 365 * 24 * 60 * 60;

export function sessionCookie(session: Session): string {
  const value = encodeURIComponent(
    JSON.stringify({ email: session.email, deliveryPostalCode: session.deliveryPostalCode }),
  );
  return `${SESSION_COOKIE_NAME}=${value}; Path=/; Max-Age=${MAXIMUM_AGE_IN_SECONDS}; SameSite=Lax`;
}

export function expiredSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
}

// The cookie value, as the server receives it or as read from document.cookie. Anything
// unreadable is treated as signed out.
export function decodeSession(value: string | null | undefined): Session | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(value));
    if (!isRecord(parsed)) return null;
    const { email, deliveryPostalCode } = parsed;
    if (typeof email !== "string" || typeof deliveryPostalCode !== "string") return null;
    return { email, deliveryPostalCode };
  } catch {
    return null;
  }
}

export function sessionCookieValue(cookieHeader: string): string | null {
  for (const pair of cookieHeader.split(";")) {
    const [name, ...value] = pair.trim().split("=");
    if (name === SESSION_COOKIE_NAME) return value.join("=");
  }
  return null;
}
