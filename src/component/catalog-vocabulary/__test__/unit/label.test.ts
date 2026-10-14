import { describe, expect, it } from "vitest";
import {
  capitalize,
  categoryLabel,
  categoryPlural,
  colorLabel,
  tagInSentence,
  tagLabel,
  tagPhrase,
} from "@/component";

describe("labels", () => {
  it("names categories in the singular and plural", () => {
    expect(categoryLabel("audio")).toBe("audio device");
    expect(categoryPlural("audio")).toBe("audio devices");
  });

  it("names tags for chips, sentences, and suggestions", () => {
    expect(tagLabel("pet-food")).toBe("Pet food");
    expect(tagInSentence("pet-food")).toBe("pet food");
    expect(tagPhrase("pet-food")).toBe("pet food");
  });

  it("keeps a tag's own capitals in sentences", () => {
    expect(tagInSentence("magsafe")).toBe("MagSafe");
  });

  it("capitalizes colours and text", () => {
    expect(colorLabel("rose gold")).toBe("Rose gold");
    expect(capitalize("")).toBe("");
  });
});
