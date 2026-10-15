import type { ProductId, SavedItem, ShopperId } from "@/core";

// Created by the model with its creation time, and unchanged so far (ADR 0007).
export function newSavedItem(ownerId: ShopperId, productId: ProductId, now: Date): SavedItem {
  return { ownerId, productId, created: now.toISOString(), modified: null };
}
