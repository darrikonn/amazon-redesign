import type { Session, SessionStore } from "@/core";
import { decodeSession, sessionCookieValue } from "./session-cookie";

export const SESSION_ENDPOINT_PATH = "/api/session";

export interface SessionEndpoint {
  save(session: Session): Promise<void>;
  clear(): Promise<void>;
}

// The server sets and clears the cookie (handleSessionRequest), so the browser only ever
// reads it.
export class FetchSessionEndpoint implements SessionEndpoint {
  async save(session: Session): Promise<void> {
    await this.send("PUT", JSON.stringify(session));
  }

  async clear(): Promise<void> {
    await this.send("DELETE", null);
  }

  private async send(method: "PUT" | "DELETE", body: string | null): Promise<void> {
    const response = await fetch(SESSION_ENDPOINT_PATH, {
      method,
      body,
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`The session endpoint answered ${response.status}`);
  }
}

// The browser's side of the fake sign-in (ADR 0030).
export class BrowserSessionStore implements SessionStore {
  constructor(
    private readonly endpoint: SessionEndpoint = new FetchSessionEndpoint(),
    private readonly readCookies: () => string = documentCookies,
  ) {}

  async current(): Promise<Session | null> {
    return decodeSession(sessionCookieValue(this.readCookies()));
  }

  async save(session: Session): Promise<void> {
    await this.endpoint.save(session);
  }

  async clear(): Promise<void> {
    await this.endpoint.clear();
  }
}

function documentCookies(): string {
  return typeof document === "undefined" ? "" : document.cookie;
}
