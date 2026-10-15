import type { Session } from "@/core";
import type { SessionEndpoint } from "./browser-session-store";
import { type RequestCookieJar, RequestSessionStore } from "./request-session-store";
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
    this.jar.set(SESSION_COOKIE_NAME, encodeSession(session));
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

// The request's cookies as the framework keeps them: values stored unencoded.
export class InMemoryCookieJar implements RequestCookieJar {
  private readonly values = new Map<string, string>();

  get(name: string): { value: string } | undefined {
    const value = this.values.get(name);
    return value === undefined ? undefined : { value };
  }

  set(name: string, value: string): void {
    this.values.set(name, value);
  }

  delete(name: string): void {
    this.values.delete(name);
  }

  // How the browser sees them in document.cookie: encoded and joined.
  header(): string {
    return [...this.values]
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join("; ");
  }

  reset(): void {
    this.values.clear();
  }
}
