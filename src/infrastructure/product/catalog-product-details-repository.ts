import type { ProductDetails, ProductDetailsRepository, ProductId } from "@/core";
import { KeyedRecords } from "../keyed-record";
import { parseProductDetailsFile } from "./product-details-file";

type DetailsSource = () => Promise<readonly ProductDetails[]>;

// The details file is imported on first use, so the bundler splits it into its own chunk
// and search never downloads it (ADR 0029).
export class CatalogProductDetailsRepository implements ProductDetailsRepository {
  private details: Promise<KeyedRecords<ProductId, ProductDetails>> | null = null;

  constructor(private readonly loadDetails: DetailsSource = loadCommittedDetails) {}

  async get(productId: ProductId): Promise<ProductDetails | null> {
    return (await this.loaded()).get(productId);
  }

  async demand(productId: ProductId): Promise<ProductDetails> {
    return (await this.loaded()).demand(productId);
  }

  async getMany(productIds: readonly ProductId[]): Promise<ProductDetails[]> {
    return (await this.loaded()).getMany(productIds);
  }

  async demandMany(productIds: readonly ProductId[]): Promise<ProductDetails[]> {
    return (await this.loaded()).demandMany(productIds);
  }

  private loaded(): Promise<KeyedRecords<ProductId, ProductDetails>> {
    this.details ??= this.loadDetails().then(
      (all) =>
        new KeyedRecords(
          "product details",
          new Map(all.map((details) => [details.productId, details])),
        ),
    );
    return this.details;
  }
}

async function loadCommittedDetails(): Promise<readonly ProductDetails[]> {
  const file = await import("./data/product-details.json");
  return parseProductDetailsFile(file.default);
}
