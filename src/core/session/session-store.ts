import type { Session } from "./session";

export interface SessionStore {
  current(): Promise<Session | null>;
  save(session: Session): Promise<void>;
  clear(): Promise<void>;
}
