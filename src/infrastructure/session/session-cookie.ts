import type { Session } from "@/core";
import { isRecord } from "@/core";

export const SESSION_COOKIE_NAME = "shop-session";

// A year, so the fake sign-in lasts like a real "keep me signed in".
export const SESSION_MAXIMUM_AGE_IN_SECONDS = 365 * 24 * 60 * 60;

export function encodeSession(session: Session): string {
  return JSON.stringify({ email: session.email, deliveryPostalCode: session.deliveryPostalCode });
}

// Anything unreadable is treated as signed out.
export function decodeSession(value: string | null | undefined): Session | null {
  if (value === null || value === undefined || value === "") return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) return null;
    const { email, deliveryPostalCode } = parsed;
    if (typeof email !== "string" || typeof deliveryPostalCode !== "string") return null;
    return { email, deliveryPostalCode };
  } catch {
    return null;
  }
}

// The session's value in a Cookie header such as document.cookie, decoded.
export function sessionCookieValue(cookieHeader: string): string | null {
  for (const pair of cookieHeader.split(";")) {
    const [name, ...value] = pair.trim().split("=");
    if (name !== SESSION_COOKIE_NAME) continue;
    try {
      return decodeURIComponent(value.join("="));
    } catch {
      return null;
    }
  }
  return null;
}
