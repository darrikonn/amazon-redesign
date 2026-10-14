import type { Session, SessionStore } from "@/core";
import { decodeSession } from "./session-cookie";

// The server's side: it reads the session the request brought and cannot change it, since
// signing in and out happens in the browser.
export class RequestSessionStore implements SessionStore {
  constructor(private readonly cookieValue: string | null) {}

  async current(): Promise<Session | null> {
    return decodeSession(this.cookieValue);
  }

  async save(): Promise<void> {
    throw new Error("Sessions are saved in the browser, not while rendering on the server");
  }

  async clear(): Promise<void> {
    throw new Error("Sessions are cleared in the browser, not while rendering on the server");
  }
}
