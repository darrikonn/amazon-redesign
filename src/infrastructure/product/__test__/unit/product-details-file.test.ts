import { describe, expect, it } from "vitest";
import { parseProductDetailsFile } from "@/infrastructure";
import { aProductDetails } from "@/test-support";

describe("parseProductDetailsFile", () => {
  it("reads details written by the catalogue build", () => {
    const details = aProductDetails();
    const sparse = aProductDetails({
      productId: "fakestore-0003",
      availability: null,
      shipping: null,
      warranty: null,
      returnPolicy: null,
      reviews: [],
    });

    expect(parseProductDetailsFile(JSON.parse(JSON.stringify([details, sparse])))).toEqual([
      details,
      sparse,
    ]);
  });

  it("fails loudly on details the app does not understand", () => {
    expect(() =>
      parseProductDetailsFile([{ ...aProductDetails(), availability: "discontinued" }]),
    ).toThrow('unknown availability "discontinued"');
    expect(() =>
      parseProductDetailsFile([{ ...aProductDetails(), reviews: [{ rating: 5 }] }]),
    ).toThrow('"reviewerName"');
  });
});
