import { beforeEach, describe, expect, it } from "vitest";
import { type Container, createTestContainer, type TestFakes } from "@/composition";

let container: Container;
let fakes: TestFakes;

beforeEach(() => {
  ({ container, fakes } = createTestContainer());
});

describe("RememberSession", () => {
  it("keeps a session SignIn could have made, tidied", async () => {
    const result = await container.rememberSession.execute({
      email: " Darri@Example.com ",
      deliveryPostalCode: "10001",
    });

    expect(result).toEqual({ status: "remembered" });
    expect(fakes.sessions.storedSession()).toEqual({
      email: "darri@example.com",
      deliveryPostalCode: "10001",
    });
  });

  it("refuses an email or ZIP code SignIn would not accept", async () => {
    const badEmail = await container.rememberSession.execute({
      email: "darri",
      deliveryPostalCode: "10001",
    });
    const badZip = await container.rememberSession.execute({
      email: "darri@example.com",
      deliveryPostalCode: "x",
    });

    expect([badEmail, badZip]).toEqual([{ status: "invalid" }, { status: "invalid" }]);
    expect(fakes.sessions.storedSession()).toBeNull();
  });
});
