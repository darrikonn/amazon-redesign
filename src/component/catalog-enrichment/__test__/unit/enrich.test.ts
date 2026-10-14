import { describe, expect, it } from "vitest";
import {
  applyOverrides,
  buildCatalog,
  deliveryDaysFrom,
  deriveTags,
  dropRareTags,
  ENRICHMENT_RULES,
  extractColor,
  mapCategory,
  normaliseDummyJsonProduct,
  normaliseFakeStoreProduct,
  parseOverrides,
  TAG_RULES,
  trimName,
} from "@/component";
import { aProduct } from "@/test-support";

const dummyJsonProduct = {
  id: 7,
  title: "  Brown Leather Belt Watch  ",
  description: "A classic watch with a genuine leather strap. Water resistant.",
  category: "mens-watches",
  priceInDollars: 89.99,
  rating: 4.19,
  tags: ["watches", "leather watches"],
  brand: "Fashion Timepieces",
  thumbnail: "https://cdn.dummyjson.com/product-images/watch/thumbnail.webp",
  shippingInformation: "Ships in 3-5 business days",
  reviewCount: 3,
};

describe("mapCategory", () => {
  it("maps a source category onto its shopper group", () => {
    expect(mapCategory("smartphones", "iPhone X")).toBe("phones");
    expect(mapCategory("womens-watches", "Rolex Datejust Women")).toBe("watches");
  });

  it("moves an item out of a mixed source category by a word in its title", () => {
    expect(mapCategory("mobile-accessories", "Beats Flex Wireless Earphones")).toBe("audio");
    expect(mapCategory("mobile-accessories", "Apple Watch Series 4 Gold")).toBe("watches");
    expect(mapCategory("mobile-accessories", "Selfie Stick Monopod")).toBe("phone-accessories");
  });

  it("fails loudly on a source category the map does not know", () => {
    expect(() => mapCategory("garden-tools", "Rake")).toThrow(
      'Unmapped source category "garden-tools"',
    );
  });
});

describe("extractColor", () => {
  it("takes the first colour word in the title", () => {
    expect(extractColor("Blue & Black Check Shirt", "")).toBe("blue");
  });

  it("falls back to the description, then to none", () => {
    expect(extractColor("Party Glasses", "Bright red frames.")).toBe("red");
    expect(extractColor("Party Glasses", "Fun for everyone.")).toBeNull();
  });

  it("prefers the longer colour at the same position and reads synonyms", () => {
    expect(extractColor("Rose Gold Plated Ring", "")).toBe("rose gold");
    expect(extractColor("Golden Shoes Woman", "")).toBe("gold");
    expect(extractColor("Space Gray Laptop", "")).toBe("grey");
  });

  it("does not read a colour inside a longer word", () => {
    expect(extractColor("Shredded Paper", "Bluetooth speaker")).toBeNull();
  });
});

describe("deliveryDaysFrom", () => {
  it("turns shipping text into days", () => {
    expect(deliveryDaysFrom("Ships overnight")).toBe(1);
    expect(deliveryDaysFrom("Ships in 1-2 business days")).toBe(2);
    expect(deliveryDaysFrom("Ships in 3-5 business days")).toBe(4);
    expect(deliveryDaysFrom("Ships in 1 week")).toBe(7);
    expect(deliveryDaysFrom("Ships in 2 weeks")).toBe(14);
    expect(deliveryDaysFrom("Ships in 1 month")).toBe(30);
  });

  it("falls back to a week for text it cannot read", () => {
    expect(deliveryDaysFrom("Ships when ready")).toBe(ENRICHMENT_RULES.unparsedDeliveryDays);
  });
});

describe("deriveTags", () => {
  it("only produces tags from the dictionary, matched as whole words", () => {
    const tags = deriveTags([
      "Wireless Leather Bluetooth thing",
      "made of steelwork and sportswear",
    ]);

    expect(tags).toEqual(["wireless", "leather"]);
    expect(tags.every((tag) => tag in TAG_RULES)).toBe(true);
  });

  it("reads source tags as well as text", () => {
    expect(deriveTags(["beverages", "Nescafe Coffee"])).toEqual(["drinks"]);
  });
});

describe("trimName", () => {
  it("keeps short titles and tidies spacing", () => {
    expect(trimName("  Apple   Airpods ")).toBe("Apple Airpods");
  });

  it("cuts long titles at a word boundary", () => {
    const name = trimName(`${"Ultra ".repeat(12)}Lamp`);

    expect(name.length).toBeLessThanOrEqual(ENRICHMENT_RULES.maximumNameLength);
    expect(name.endsWith("Ultra")).toBe(true);
  });
});

describe("normaliseDummyJsonProduct", () => {
  it("builds the app's product from a DummyJSON product", () => {
    expect(normaliseDummyJsonProduct(dummyJsonProduct)).toEqual({
      id: "dummyjson-0007",
      source: "dummyjson",
      sourceId: 7,
      name: "Brown Leather Belt Watch",
      category: "watches",
      categoryLabel: "watch",
      categoryPlural: "watches",
      priceInCents: 8999,
      rating: 4.2,
      reviewCount: 3,
      deliveryDays: 4,
      color: "brown",
      tags: ["waterproof", "leather"],
      image: "https://cdn.dummyjson.com/product-images/watch/thumbnail.webp",
      brand: "Fashion Timepieces",
    });
  });
});

describe("normaliseFakeStoreProduct", () => {
  it("uses the review count from the rating and a fixed delivery estimate", () => {
    const product = normaliseFakeStoreProduct({
      id: 9,
      title: "WD 2TB Elements Portable External Hard Drive - USB 3.0 ",
      description: "USB 3.0 and USB 2.0 compatibility",
      category: "electronics",
      priceInDollars: 64,
      rating: 3.3,
      reviewCount: 203,
      image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_.jpg",
    });

    expect(product).toMatchObject({
      id: "fakestore-0009",
      category: "computer-accessories",
      reviewCount: 203,
      deliveryDays: ENRICHMENT_RULES.fakeStoreDeliveryDays,
      tags: ["portable"],
      brand: null,
    });
  });
});

describe("applyOverrides", () => {
  it("replaces only the fields an override names and keeps labels in step with the category", () => {
    const product = aProduct({ sourceId: 42, color: null, tags: ["casual"] });
    const [corrected] = applyOverrides([product], {
      "42": { reason: "test", color: "purple", category: "bags" },
    });

    expect(corrected).toMatchObject({
      color: "purple",
      tags: ["casual"],
      category: "bags",
      categoryLabel: "bag",
      categoryPlural: "bags",
    });
  });

  it("refuses an override without a reason or with an unknown value", () => {
    expect(() => parseOverrides({ dummyjson: { "1": { color: "red" } } })).toThrow('"reason"');
    expect(() =>
      parseOverrides({ dummyjson: { "1": { reason: "x", tags: ["sparkly"] } } }),
    ).toThrow('unknown tag "sparkly"');
    expect(() => parseOverrides({ amazon: {} })).toThrow('unknown source "amazon"');
  });
});

describe("buildCatalog", () => {
  it("applies an override that adds a tag after the rare tag rule has run", () => {
    const raw = { products: [rawDummyJson(dummyJsonProduct)] };
    const overrides = parseOverrides({ dummyjson: { "7": { reason: "test", tags: ["vegan"] } } });

    expect(buildCatalog("dummyjson", raw, overrides).products[0]?.tags).toEqual(["vegan"]);
  });

  it("applies overrides after the rules", () => {
    const raw = { products: [{ ...rawDummyJson(dummyJsonProduct), id: 7 }] };
    const overrides = parseOverrides({ dummyjson: { "7": { reason: "test", color: "black" } } });

    expect(buildCatalog("dummyjson", raw, overrides).products[0]?.color).toBe("black");
  });
});

describe("dropRareTags", () => {
  it("keeps only tags that at least two products share", () => {
    const products = dropRareTags([
      aProduct({ id: "a", tags: ["leather", "luxury"] }),
      aProduct({ id: "b", tags: ["leather"] }),
    ]);

    expect(products.map((product) => product.tags)).toEqual([["leather"], ["leather"]]);
  });
});

function rawDummyJson(product: typeof dummyJsonProduct) {
  return {
    ...product,
    price: product.priceInDollars,
    reviews: Array.from({ length: product.reviewCount }, () => ({ rating: 4 })),
  };
}
