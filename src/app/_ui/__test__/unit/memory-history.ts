import type { AddressHistory } from "@/app/_ui/address-history";

type Entry = {
  url: string;
  isProductEntry: boolean;
};

// A browser history the test drives by hand: Back lands only when the test says so, as
// the real one lands after the call returns.
export class MemoryHistory implements AddressHistory {
  private readonly entries: Entry[];
  private index = 0;
  private pendingBack = 0;

  constructor(url: string) {
    this.entries = [{ url, isProductEntry: false }];
  }

  currentUrl(): string {
    return this.current().url;
  }

  isProductEntry(): boolean {
    return this.current().isProductEntry;
  }

  pushProductEntry(url: string): void {
    this.entries.splice(this.index + 1, Number.POSITIVE_INFINITY, { url, isProductEntry: true });
    this.index += 1;
  }

  replaceAddress(url: string): void {
    this.entries[this.index] = { ...this.current(), url };
  }

  back(): void {
    this.pendingBack += 1;
  }

  landBack(): void {
    this.index = Math.max(0, this.index - this.pendingBack);
    this.pendingBack = 0;
  }

  entryCount(): number {
    return this.entries.length;
  }

  private current(): Entry {
    const entry = this.entries[this.index];
    if (entry === undefined) throw new Error("The history has no current entry");
    return entry;
  }
}
