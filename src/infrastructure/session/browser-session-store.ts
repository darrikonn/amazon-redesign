import type { Session, SessionStore } from "@/core";
import { decodeSession, sessionCookieValue } from "./session-cookie";

const SESSION_ENDPOINT_PATH = "/api/session";

export interface SessionEndpoint {
  save(session: Session): Promise<void>;
  clear(): Promise<void>;
}

// The server sets and clears the cookie when the session endpoint is called, so the
// browser only ever reads it. In the browser the endpoint is on the page's own origin.
export class FetchSessionEndpoint implements SessionEndpoint {
  constructor(private readonly url: string = SESSION_ENDPOINT_PATH) {}

  async save(session: Session): Promise<void> {
    await this.send("PUT", JSON.stringify(session));
  }

  async clear(): Promise<void> {
    await this.send("DELETE", null);
  }

  private async send(method: "PUT" | "DELETE", body: string | null): Promise<void> {
    const response = await fetch(this.url, {
      method,
      body,
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`The session endpoint answered ${response.status}`);
  }
}

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
