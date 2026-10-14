import type { SessionStore } from "@/core";

// The shopper's cart, orders, and list stay stored for their next sign-in.
export class SignOut {
  constructor(private readonly sessions: SessionStore) {}

  async execute(): Promise<void> {
    await this.sessions.clear();
  }
}
