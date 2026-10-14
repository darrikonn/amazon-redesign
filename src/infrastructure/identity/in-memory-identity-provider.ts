import type { IdentityProvider, Shopper } from "@/core";

export class InMemoryIdentityProvider implements IdentityProvider {
  readonly calls: "currentShopper"[] = [];
  private signedIn: Shopper | null = null;

  seedSignedInShopper(shopper: Shopper): void {
    this.signedIn = shopper;
  }

  async currentShopper(): Promise<Shopper> {
    this.calls.push("currentShopper");
    if (this.signedIn === null) throw new Error("No shopper is signed in; seed one first");
    return this.signedIn;
  }

  reset(): void {
    this.calls.length = 0;
    this.signedIn = null;
  }
}
