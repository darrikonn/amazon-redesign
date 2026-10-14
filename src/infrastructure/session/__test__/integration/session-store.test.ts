import { describe, expect, it } from "vitest";
import type { Session, SessionStore } from "@/core";
import {
  BrowserSessionStore,
  decodeSession,
  handleSessionRequest,
  InMemorySessionStore,
  RequestSessionStore,
  type SessionEndpoint,
  sessionCookie,
  sessionCookieValue,
} from "@/infrastructure";
import { aSession } from "@/test-support";

// Stands in for the server: what it would set is what the browser then reads.
class CookieServer implements SessionEndpoint {
  cookies = "theme=dark";

  async save(session: Session): Promise<void> {
    const response = await handleSessionRequest(
      new Request("http://shop.test/api/session", { method: "PUT", body: JSON.stringify(session) }),
    );
    this.cookies = `theme=dark; ${(response.headers.get("Set-Cookie") ?? "").split(";")[0]}`;
  }

  async clear(): Promise<void> {
    this.cookies = "theme=dark";
  }
}

describe("the session cookie", () => {
  it("round trips a session through its cookie value", () => {
    const session = aSession({ email: "darri.konn@gmail.com", deliveryPostalCode: "10001" });
    const cookies = `theme=dark; ${sessionCookie(session).split(";")[0]}`;

    expect(decodeSession(sessionCookieValue(cookies))).toEqual(session);
  });

  it("reads anything unreadable as signed out", () => {
    expect(decodeSession(null)).toBeNull();
    expect(decodeSession("")).toBeNull();
    expect(decodeSession("%7Bnot-json")).toBeNull();
    expect(decodeSession(encodeURIComponent(JSON.stringify({ email: 4 })))).toBeNull();
    expect(sessionCookieValue("theme=dark")).toBeNull();
  });
});

describe("handleSessionRequest", () => {
  it("sets the cookie on PUT and expires it on DELETE", async () => {
    const put = await handleSessionRequest(
      new Request("http://shop.test/api/session", {
        method: "PUT",
        body: JSON.stringify(aSession()),
      }),
    );
    const remove = await handleSessionRequest(
      new Request("http://shop.test/api/session", { method: "DELETE" }),
    );

    expect(put.status).toBe(204);
    expect(put.headers.get("Set-Cookie")).toMatch(
      /^shop-session=.+; Path=\/; Max-Age=\d+; SameSite=Lax$/,
    );
    expect(remove.headers.get("Set-Cookie")).toBe("shop-session=; Path=/; Max-Age=0; SameSite=Lax");
  });

  it("refuses a body that is not a session, and other methods", async () => {
    const bad = await handleSessionRequest(
      new Request("http://shop.test/api/session", { method: "PUT", body: "{}" }),
    );
    const get = await handleSessionRequest(new Request("http://shop.test/api/session"));

    expect(bad.status).toBe(400);
    expect(get.status).toBe(405);
  });
});

describe("BrowserSessionStore", () => {
  it("signs in and out through the endpoint and reads the cookie it set", async () => {
    // Arrange
    const server = new CookieServer();
    const store = new BrowserSessionStore(server, () => server.cookies);

    // Act
    await store.save(aSession({ email: "darri.konn@gmail.com" }));
    const signedIn = await store.current();
    await store.clear();

    // Assert
    expect(signedIn).toEqual(aSession({ email: "darri.konn@gmail.com" }));
    expect(await store.current()).toBeNull();
  });
});

describe("RequestSessionStore", () => {
  it("reads the request's session and cannot change it", async () => {
    const value = sessionCookieValue(sessionCookie(aSession()).split(";")[0] ?? "");
    const store: SessionStore = new RequestSessionStore(value);

    expect(await store.current()).toEqual(aSession());
    expect(await new RequestSessionStore(null).current()).toBeNull();
    await expect(store.save(aSession())).rejects.toThrow("saved in the browser");
    await expect(store.clear()).rejects.toThrow("cleared in the browser");
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
