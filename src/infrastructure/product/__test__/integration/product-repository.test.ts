import { describe, expect, it } from "vitest";
import type { ProductRepository } from "@/core";
import { NotFoundError } from "@/core";
import { CATALOG, CatalogProductRepository, InMemoryProductRepository } from "@/infrastructure";
import { aProduct } from "@/test-support";

const lamp = aProduct({ id: "lamp" });
const bag = aProduct({ id: "bag", category: "backpack" });

function seededFake(): InMemoryProductRepository {
  const repository = new InMemoryProductRepository();
  repository.seedProducts([lamp, bag]);
  return repository;
}

const implementations: [string, () => ProductRepository][] = [
  ["CatalogProductRepository", () => new CatalogProductRepository([lamp, bag])],
  ["InMemoryProductRepository", seededFake],
];

describe.each(implementations)("%s", (_, create) => {
  it("gets a product or null", async () => {
    const repository = create();

    expect(await repository.get("lamp")).toEqual(lamp);
    expect(await repository.get("ghost")).toBeNull();
  });

  it("demands a product or throws not found", async () => {
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

  it("lists every product", async () => {
    expect(await create().list()).toEqual([lamp, bag]);
  });
});

describe("CatalogProductRepository", () => {
  it("serves the bundled catalog by default", async () => {
    const products = await new CatalogProductRepository().list();

    expect(products).toHaveLength(CATALOG.length);
    expect(new Set(products.map((product) => product.id)).size).toBe(CATALOG.length);
  });
});

describe("InMemoryProductRepository", () => {
  it("records calls and forgets everything on reset", async () => {
    // Arrange
    const repository = seededFake();
    await repository.getMany(["lamp"]);

    // Act
    const recorded = [...repository.calls];
    repository.reset();

    // Assert
    expect(recorded).toEqual([{ method: "getMany", ids: ["lamp"] }]);
    expect(repository.calls).toEqual([]);
    expect(await repository.list()).toEqual([]);
  });
});
