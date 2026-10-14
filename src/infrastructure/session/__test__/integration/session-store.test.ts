import { describe, expect, it } from "vitest";
import type { Session, SessionStore } from "@/core";
import {
  BrowserSessionStore,
  decodeSession,
  encodeSession,
  InMemorySessionStore,
  type RequestCookieJar,
  RequestSessionStore,
  type SessionEndpoint,
  sessionCookieValue,
} from "@/infrastructure";
import { aSession } from "@/test-support";

// The request's cookies as the framework keeps them: values stored unencoded.
class CookieJar implements RequestCookieJar {
  readonly values = new Map<string, string>();

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

  // How the browser sees them in document.cookie: encoded, beside other cookies.
  header(): string {
    return [
      "theme=dark",
      ...[...this.values].map(([name, value]) => `${name}=${encodeURIComponent(value)}`),
    ].join("; ");
  }
}

// Stands in for the session endpoint: the server saves into the jar the browser reads.
class SessionServer implements SessionEndpoint {
  readonly jar = new CookieJar();
  private readonly store = new RequestSessionStore(this.jar);

  async save(session: Session): Promise<void> {
    await this.store.save(session);
  }

  async clear(): Promise<void> {
    await this.store.clear();
  }
}

describe("the session cookie", () => {
  it("round trips a session", () => {
    const session = aSession({ email: "darri.konn@gmail.com", deliveryPostalCode: "10001" });
    const header = `theme=dark; shop-session=${encodeURIComponent(encodeSession(session))}`;

    expect(decodeSession(sessionCookieValue(header))).toEqual(session);
  });

  it("reads anything unreadable as signed out", () => {
    expect(decodeSession(null)).toBeNull();
    expect(decodeSession("")).toBeNull();
    expect(decodeSession("{not-json")).toBeNull();
    expect(decodeSession(JSON.stringify({ email: 4 }))).toBeNull();
    expect(sessionCookieValue("theme=dark")).toBeNull();
    expect(sessionCookieValue("shop-session=%E0%A4%A")).toBeNull();
  });
});

describe("RequestSessionStore", () => {
  it("reads, saves, and clears the request's session cookie", async () => {
    // Arrange
    const jar = new CookieJar();
    const store: SessionStore = new RequestSessionStore(jar);

    // Act
    const before = await store.current();
    await store.save(aSession());
    const saved = await store.current();
    await store.clear();

    // Assert
    expect(before).toBeNull();
    expect(saved).toEqual(aSession());
    expect(await store.current()).toBeNull();
  });
});

describe("BrowserSessionStore", () => {
  it("signs in and out through the endpoint and reads the cookie the server set", async () => {
    // Arrange
    const server = new SessionServer();
    const store = new BrowserSessionStore(server, () => server.jar.header());

    // Act
    await store.save(aSession({ email: "darri.konn@gmail.com" }));
    const signedIn = await store.current();
    await store.clear();

    // Assert
    expect(signedIn).toEqual(aSession({ email: "darri.konn@gmail.com" }));
    expect(await store.current()).toBeNull();
  });
});

describe("InMemorySessionStore", () => {
  it("keeps the seeded session, records calls, and forgets on reset", async () => {
    // Arrange
    const store = new InMemorySessionStore();
    store.seedSession(aSession());

    // Act
    const current = await store.current();
    await store.clear();
    const recorded = [...store.calls];
    store.reset();

    // Assert
    expect(current).toEqual(aSession());
    expect(recorded).toEqual(["current", "clear"]);
    expect(store.storedSession()).toBeNull();
    expect(store.calls).toEqual([]);
  });
});
