import { describe, expect, it } from "vitest";
import {
  colorLabel,
  FEATURE_VOCABULARY,
  featureInSentence,
  featureLabel,
  featurePhrase,
} from "@/component";

describe("feature vocabulary", () => {
  it("names each feature once", () => {
    const features = FEATURE_VOCABULARY.map((entry) => entry.feature);

    expect(new Set(features).size).toBe(features.length);
  });

  it("uses the first synonym as the phrase to type", () => {
    expect(featurePhrase("noise-cancelling")).toBe("noise cancelling");
    expect(featureLabel("noise-cancelling")).toBe("Noise cancelling");
  });

  it("keeps USB capitalized in sentences", () => {
    expect(featureLabel("usb")).toBe("USB");
    expect(featureInSentence("usb")).toBe("USB");
    expect(featureInSentence("dimmable")).toBe("dimmable");
  });
});

describe("colorLabel", () => {
  it("capitalizes the colour", () => {
    expect(colorLabel("navy")).toBe("Navy");
  });
});
