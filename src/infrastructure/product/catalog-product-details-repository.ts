import type { ProductDetails, ProductDetailsRepository, ProductId } from "@/core";
import { NotFoundError } from "@/core";
import { parseProductDetailsFile } from "./product-details-file";

type DetailsSource = () => Promise<readonly ProductDetails[]>;

// The details file is imported on first use, so the bundler splits it into its own chunk
// and search never downloads it (ADR 0029).
export class CatalogProductDetailsRepository implements ProductDetailsRepository {
  private detailsById: Promise<ReadonlyMap<ProductId, ProductDetails>> | null = null;

  constructor(private readonly loadDetails: DetailsSource = loadCommittedDetails) {}

  async get(productId: ProductId): Promise<ProductDetails | null> {
    return (await this.byId()).get(productId) ?? null;
  }

  async demand(productId: ProductId): Promise<ProductDetails> {
    const details = (await this.byId()).get(productId);
    if (details === undefined) throw new NotFoundError("product details", productId);
    return details;
  }

  async getMany(productIds: readonly ProductId[]): Promise<ProductDetails[]> {
    const detailsById = await this.byId();
    return productIds.flatMap((productId) => {
      const details = detailsById.get(productId);
      return details === undefined ? [] : [details];
    });
  }

  async demandMany(productIds: readonly ProductId[]): Promise<ProductDetails[]> {
    return Promise.all(productIds.map((productId) => this.demand(productId)));
  }

  private byId(): Promise<ReadonlyMap<ProductId, ProductDetails>> {
    this.detailsById ??= this.loadDetails().then(
      (all) => new Map(all.map((details) => [details.productId, details])),
    );
    return this.detailsById;
  }
}

async function loadCommittedDetails(): Promise<readonly ProductDetails[]> {
  const file = await import("./data/product-details.json");
  return parseProductDetailsFile(file.default);
}
