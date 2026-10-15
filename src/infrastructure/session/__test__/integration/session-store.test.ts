import { describe, expect, it } from "vitest";
import type { SessionStore } from "@/core";
import {
  BrowserSessionStore,
  decodeSession,
  encodeSession,
  InMemoryCookieJar,
  InMemorySessionEndpoint,
  InMemorySessionStore,
  RequestSessionStore,
  sessionCookieValue,
} from "@/infrastructure";
import { aSession } from "@/test-support";

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
    const jar = new InMemoryCookieJar();
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
    const endpoint = new InMemorySessionEndpoint();
    const store = new BrowserSessionStore(endpoint, () => endpoint.cookieHeader());

    // Act
    await store.save(aSession({ email: "darri.konn@gmail.com" }));
    const signedIn = await store.current();
    await store.clear();

    // Assert
    expect(signedIn).toEqual(aSession({ email: "darri.konn@gmail.com" }));
    expect(await store.current()).toBeNull();
    expect(endpoint.calls).toEqual(["save", "clear"]);
  });
});

describe("InMemorySessionEndpoint", () => {
  it("forgets its calls and the cookie on reset", async () => {
    const endpoint = new InMemorySessionEndpoint();
    await endpoint.save(aSession());

    endpoint.reset();

    expect(endpoint.calls).toEqual([]);
    expect(endpoint.cookieHeader()).toBe("theme=dark");
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
