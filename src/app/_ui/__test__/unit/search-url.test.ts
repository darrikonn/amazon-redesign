import { describe, expect, it } from "vitest";
import { productIdIn, readSearchParameters, searchUrl, withProduct } from "@/app/_ui/search-url";

describe("readSearchParameters", () => {
  it("reads the query and the sort as typed", () => {
    expect(readSearchParameters({ q: "lamp", sort: "top-rated" })).toEqual({
      text: "lamp",
      sort: "top-rated",
    });
  });

  it("reads missing parameters as empty", () => {
    expect(readSearchParameters({})).toEqual({ text: "", sort: "" });
  });

  it("uses the first value of a repeated parameter", () => {
    expect(readSearchParameters({ q: ["lamp", "bag"] }).text).toBe("lamp");
  });
});

describe("searchUrl", () => {
  it("is the bare home page without a query", () => {
    expect(searchUrl({ text: "  ", sort: "best-match" })).toBe("/");
  });

  it("encodes the query and leaves out the default sort", () => {
    expect(searchUrl({ text: "lamp under $40", sort: "best-match" })).toBe("/?q=lamp+under+%2440");
  });

  it("keeps a non default sort", () => {
    expect(searchUrl({ text: "lamp", sort: "lowest-price" })).toBe("/?q=lamp&sort=lowest-price");
  });

  it("round trips through the reader", () => {
    const parameters = { text: "red lamp & more", sort: "top-rated" } as const;
    const query = Object.fromEntries(new URLSearchParams(searchUrl(parameters).slice(2)));

    expect(readSearchParameters(query)).toEqual(parameters);
  });
});

describe("the open product in the address", () => {
  it("is added to a search address and read back", () => {
    const address = searchUrl({ text: "watches", sort: "best-match", productId: "dummyjson-0007" });

    expect(address).toBe("/?q=watches&product=dummyjson-0007");
    expect(productIdIn(address)).toBe("dummyjson-0007");
  });

  it("is set and removed without touching the rest of the address", () => {
    const opened = withProduct("https://shop.test/?q=watches&sort=top-rated", "dummyjson-0007");

    expect(opened).toBe("/?q=watches&sort=top-rated&product=dummyjson-0007");
    expect(withProduct(opened, null)).toBe("/?q=watches&sort=top-rated");
  });

  it("is absent when no product is open", () => {
    expect(productIdIn("/?q=watches")).toBeNull();
  });
});
