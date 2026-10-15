import type { ProductId } from "@/core";
import type { AddressHistory } from "./address-history";
import { productIdIn, withProduct } from "./search-url";

export type CloseOutcome = "closed" | "stepping-back" | "already-stepping-back";

// The open product lives in the address, so Back closes the modal, Forward reopens it, and
// a shared link opens it straight away (ADR 0029). Opening pushes an entry; closing steps
// back over that entry, or, on an entry it did not push (a shared link), drops the product
// from the address in place.
export class ProductModalHistory {
  // history.back() lands later, so a second close before it lands must not step back again.
  private isSteppingBack = false;

  constructor(private readonly history: AddressHistory) {}

  open(productId: ProductId): void {
    this.history.pushProductEntry(withProduct(this.history.currentUrl(), productId));
  }

  close(): CloseOutcome {
    if (this.isSteppingBack) return "already-stepping-back";
    if (this.history.isProductEntry()) {
      this.isSteppingBack = true;
      this.history.back();
      return "stepping-back";
    }
    this.history.replaceAddress(withProduct(this.history.currentUrl(), null));
    return "closed";
  }

  // After Back or Forward, the product is whichever the address now names.
  followHistory(): ProductId | null {
    this.isSteppingBack = false;
    return productIdIn(this.history.currentUrl());
  }
}
