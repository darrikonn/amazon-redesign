import { validSession } from "@/component";
import type { SessionStore } from "@/core";

export type RememberSessionRequest = {
  email: string;
  deliveryPostalCode: string;
};

export type RememberSessionResult = { status: "remembered" } | { status: "invalid" };

// The server half of signing in: it keeps the session the browser asks for, after checking
// it is one SignIn could have made (ADR 0030).
export class RememberSession {
  constructor(private readonly sessions: SessionStore) {}

  async execute(request: RememberSessionRequest): Promise<RememberSessionResult> {
    const session = validSession(request);
    if (session === null) return { status: "invalid" };
    await this.sessions.save(session);
    return { status: "remembered" };
  }
}
