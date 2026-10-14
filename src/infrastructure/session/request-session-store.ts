import type { Session, SessionStore } from "@/core";
import {
  decodeSession,
  encodeSession,
  SESSION_COOKIE_NAME,
  SESSION_MAXIMUM_AGE_IN_SECONDS,
} from "./session-cookie";

// The request's cookies, as the framework hands them to the server. Setting and deleting
// only work while answering the session endpoint, not while rendering a page.
export type RequestCookieJar = {
  get(name: string): { value: string } | undefined;
  set(
    name: string,
    value: string,
    options: { path: string; maxAge: number; sameSite: "lax" },
  ): unknown;
  delete(name: string): unknown;
};

export class RequestSessionStore implements SessionStore {
  constructor(private readonly cookies: RequestCookieJar) {}

  async current(): Promise<Session | null> {
    return decodeSession(this.cookies.get(SESSION_COOKIE_NAME)?.value);
  }

  async save(session: Session): Promise<void> {
    this.cookies.set(SESSION_COOKIE_NAME, encodeSession(session), {
      path: "/",
      maxAge: SESSION_MAXIMUM_AGE_IN_SECONDS,
      sameSite: "lax",
    });
  }

  async clear(): Promise<void> {
    this.cookies.delete(SESSION_COOKIE_NAME);
  }
}
