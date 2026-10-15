import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FetchSessionEndpoint } from "@/infrastructure";
import { aSession, type SessionEndpointStandIn, startSessionEndpointStandIn } from "@/test-support";

let standIn: SessionEndpointStandIn;

beforeEach(async () => {
  standIn = await startSessionEndpointStandIn();
});

afterEach(async () => {
  await standIn.close();
});

describe("FetchSessionEndpoint", () => {
  it("puts the session as JSON to save it and deletes it to sign out", async () => {
    // Arrange
    const endpoint = new FetchSessionEndpoint(standIn.url);

    // Act
    await endpoint.save(aSession({ email: "darri.konn@gmail.com" }));
    await endpoint.clear();

    // Assert
    expect(standIn.requests).toEqual([
      {
        method: "PUT",
        path: "/api/session",
        contentType: "application/json",
        body: JSON.stringify(aSession({ email: "darri.konn@gmail.com" })),
      },
      { method: "DELETE", path: "/api/session", contentType: "application/json", body: "" },
    ]);
  });

  it("fails when the endpoint refuses, so the shop never shows a sign-in that did not happen", async () => {
    standIn.answerWith(400);

    await expect(new FetchSessionEndpoint(standIn.url).save(aSession())).rejects.toThrow(
      "The session endpoint answered 400",
    );
  });
});
