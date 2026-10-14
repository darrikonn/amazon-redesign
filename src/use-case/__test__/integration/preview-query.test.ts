import { describe, expect, it } from "vitest";
import { createTestContainer } from "@/composition";

describe("PreviewQuery", () => {
  it("lists what a partly typed query would set", async () => {
    const { container } = createTestContainer();

    const preview = await container.previewQuery.execute("wireless headphones under $1");

    expect(preview.labels).toEqual(["Wireless", "Audio devices", "Under $1"]);
  });
});
