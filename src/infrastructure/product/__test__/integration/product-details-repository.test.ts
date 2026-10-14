import { describe, expect, it } from "vitest";
import type { ProductDetailsRepository } from "@/core";
import { NotFoundError } from "@/core";
import {
  CATALOG,
  CatalogProductDetailsRepository,
  InMemoryProductDetailsRepository,
} from "@/infrastructure";
import { aProductDetails } from "@/test-support";

const lamp = aProductDetails({ productId: "lamp" });
const bag = aProductDetails({ productId: "bag", reviews: [] });

function seededFake(): InMemoryProductDetailsRepository {
  const repository = new InMemoryProductDetailsRepository();
  repository.seedManyDetails([lamp, bag]);
  return repository;
}

const implementations: [string, () => ProductDetailsRepository][] = [
  [
    "CatalogProductDetailsRepository",
    () => new CatalogProductDetailsRepository(async () => [lamp, bag]),
  ],
  ["InMemoryProductDetailsRepository", seededFake],
];

describe.each(implementations)("%s", (_, create) => {
  it("gets details or null", async () => {
    const repository = create();

    expect(await repository.get("lamp")).toEqual(lamp);
    expect(await repository.get("ghost")).toBeNull();
  });

  it("demands details or throws not found", async () => {
    const repository = create();

    expect(await repository.demand("bag")).toEqual(bag);
    await expect(repository.demand("ghost")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("gets many in the requested order, skipping unknown ids", async () => {
    expect(await create().getMany(["bag", "ghost", "lamp"])).toEqual([bag, lamp]);
  });

  it("demands many or throws when any is missing", async () => {
    const repository = create();

    expect(await repository.demandMany(["bag", "lamp"])).toEqual([bag, lamp]);
    await expect(repository.demandMany(["bag", "ghost"])).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("CatalogProductDetailsRepository", () => {
  it("serves the committed details file, one entry for every catalogue product", async () => {
    // Arrange
    const repository = new CatalogProductDetailsRepository();
    const productIds = CATALOG.map((product) => product.id);

    // Act
    const details = await repository.demandMany(productIds);

    // Assert
    expect(details.map((entry) => entry.productId)).toEqual(productIds);
  });
});

describe("InMemoryProductDetailsRepository", () => {
  it("records calls and forgets everything on reset", async () => {
    // Arrange
    const repository = seededFake();
    await repository.getMany(["lamp"]);

    // Act
    const recorded = [...repository.calls];
    repository.reset();

    // Assert
    expect(recorded).toEqual([{ method: "getMany", productIds: ["lamp"] }]);
    expect(repository.calls).toEqual([]);
    expect(await repository.get("lamp")).toBeNull();
  });
});
