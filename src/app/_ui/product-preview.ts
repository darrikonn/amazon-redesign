import type { CategoryId, ProductId } from "@/core";

// What is already on screen about a product (a card or a panel entry), so the modal can
// open at once while its details load (ADR 0029).
export type ProductPreview = {
  id: ProductId;
  name: string;
  category: CategoryId;
  image: string | null;
  priceInCents: number;
  rating: number;
};
