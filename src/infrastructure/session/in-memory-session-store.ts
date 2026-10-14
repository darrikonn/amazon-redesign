import type { Session, SessionStore } from "@/core";

export class InMemorySessionStore implements SessionStore {
  readonly calls: ("current" | "save" | "clear")[] = [];
  private session: Session | null = null;

  seedSession(session: Session): void {
    this.session = session;
  }

  storedSession(): Session | null {
    return this.session;
  }

  async current(): Promise<Session | null> {
    this.calls.push("current");
    return this.session;
  }

  async save(session: Session): Promise<void> {
    this.calls.push("save");
    this.session = session;
  }

  async clear(): Promise<void> {
    this.calls.push("clear");
    this.session = null;
  }

  reset(): void {
    this.calls.length = 0;
    this.session = null;
  }
}
