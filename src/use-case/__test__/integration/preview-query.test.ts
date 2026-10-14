import { describe, expect, it } from "vitest";
import { createTestContainer } from "@/composition";

describe("PreviewQuery", () => {
  it("lists what a partly typed query would set", async () => {
    const { container } = createTestContainer();

    const preview = await container.previewQuery.execute("dimmable desk lamp under $4");

    expect(preview.labels).toEqual(["Dimmable", "Desk lamps", "Under $4"]);
  });
});
