import type { RequestCookieJar } from "./request-session-store";

// The request's cookies as the framework keeps them: values stored unencoded.
export type CookieJarCall = { method: "get" | "set" | "delete"; name: string };

export class InMemoryCookieJar implements RequestCookieJar {
  readonly calls: CookieJarCall[] = [];
  private readonly values = new Map<string, string>();

  get(name: string): { value: string } | undefined {
    this.calls.push({ method: "get", name });
    const value = this.values.get(name);
    return value === undefined ? undefined : { value };
  }

  set(name: string, value: string): void {
    this.calls.push({ method: "set", name });
    this.values.set(name, value);
  }

  delete(name: string): void {
    this.calls.push({ method: "delete", name });
    this.values.delete(name);
  }

  // How the browser sees them in document.cookie: encoded and joined.
  header(): string {
    return [...this.values]
      .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
      .join("; ");
  }

  // A cookie the server set earlier, without counting it as a call.
  seedCookie(name: string, value: string): void {
    this.values.set(name, value);
  }

  reset(): void {
    this.calls.length = 0;
    this.values.clear();
  }
}
