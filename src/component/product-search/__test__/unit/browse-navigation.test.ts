import { describe, expect, it } from "vitest";
import {
  buildBrowseNavigation,
  filterProducts,
  interpretQuery,
  NAVIGATION_RULES,
} from "@/component";
import type { Product } from "@/core";
import { aProduct } from "@/test-support";

const watch = { category: "watches", categoryLabel: "watch", categoryPlural: "watches" } as const;
const jewellery = {
  category: "jewellery",
  categoryLabel: "piece of jewellery",
  categoryPlural: "jewellery",
} as const;

const catalog: Product[] = [
  aProduct({ ...watch, id: "rolex", tags: ["luxury"] }),
  aProduct({ ...watch, id: "longines", tags: ["luxury", "elegant"] }),
  aProduct({ ...watch, id: "belt", tags: ["leather"] }),
  aProduct({ ...jewellery, id: "earring" }),
  aProduct({ id: "laptop", tags: ["luxury"] }),
];

function navigationFor(text: string, products: readonly Product[] = catalog) {
  const interpretation = interpretQuery(text);
  return buildBrowseNavigation(
    products,
    text,
    interpretation,
    filterProducts(products, interpretation.intent),
  );
}

describe("buildBrowseNavigation", () => {
  it("shows the department, its sub-groups across the catalogue, and related departments", () => {
    expect(navigationFor("luxury watches")).toEqual({
      heading: { label: "Watches", productCount: 3, text: "watches", isCurrent: false },
      headingLabel: "Watches",
      links: [
        { label: "Luxury", productCount: 2, text: "luxury watches", isCurrent: true },
        { label: "Elegant", productCount: 1, text: "elegant watches", isCurrent: false },
        { label: "Leather", productCount: 1, text: "leather watches", isCurrent: false },
      ],
      related: [{ label: "Jewellery", productCount: 1, text: "jewellery", isCurrent: false }],
    });
  });

  it("marks the department itself as current when nothing else was asked", () => {
    expect(navigationFor("watches")?.heading?.isCurrent).toBe(true);
  });

  it("uses the department all results share even when the text did not name it", () => {
    expect(navigationFor("leather")?.headingLabel).toBe("Watches");
  });

  it("splits results across departments when they span several", () => {
    expect(navigationFor("luxury")).toEqual({
      heading: null,
      headingLabel: "Results by department",
      links: [
        { label: "Watches", productCount: 2, text: "luxury watches", isCurrent: false },
        { label: "Laptops", productCount: 1, text: "luxury laptops", isCurrent: false },
      ],
      related: [],
    });
  });

  it("leaves out related departments with no products", () => {
    const related = navigationFor("laptops")?.related.map((link) => link.label);

    expect(related).toEqual([]);
  });

  it("shows nothing when the search found nothing", () => {
    expect(navigationFor("purple watches")).toBeNull();
  });

  it("caps the number of sub-group links", () => {
    const tags = [
      "luxury",
      "elegant",
      "leather",
      "steel",
      "durable",
      "smart",
      "casual",
      "women",
      "men",
    ] as const;
    const many = tags.map((tag) => aProduct({ ...watch, id: tag, tags: [tag] }));

    expect(navigationFor("watches", many)?.links).toHaveLength(NAVIGATION_RULES.maximumTagLinks);
  });
});
