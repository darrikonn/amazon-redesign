import type { Session } from "@/core";
import type { SessionEndpoint } from "./browser-session-store";
import { InMemoryCookieJar } from "./in-memory-cookie-jar";
import { RequestSessionStore } from "./request-session-store";
import { encodeSession, SESSION_COOKIE_NAME } from "./session-cookie";

export type SessionEndpointCall = "save" | "clear";

// The test fake for the session endpoint: it answers as the server would, setting the
// cookie in its own jar, records its calls, and offers the cookie header the browser
// would then read.
export class InMemorySessionEndpoint implements SessionEndpoint {
  readonly calls: SessionEndpointCall[] = [];
  private readonly jar = new InMemoryCookieJar();
  private readonly server = new RequestSessionStore(this.jar);

  // A session the server set before the test began, as if the shopper signed in earlier.
  seedSession(session: Session): void {
    this.jar.seedCookie(SESSION_COOKIE_NAME, encodeSession(session));
  }

  async save(session: Session): Promise<void> {
    this.calls.push("save");
    await this.server.save(session);
  }

  async clear(): Promise<void> {
    this.calls.push("clear");
    await this.server.clear();
  }

  cookieHeader(): string {
    return this.jar.header();
  }

  reset(): void {
    this.calls.length = 0;
    this.jar.reset();
  }
}
