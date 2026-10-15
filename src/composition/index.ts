import type { RequestCookieJar } from "@/infrastructure";
import type { Container } from "./container";
import { createLocalContainer } from "./local-container";
import { createProductionContainer } from "./production-container";

export type { Container } from "./container";
export { createLocalContainer } from "./local-container";
export { createProductionContainer } from "./production-container";
export { createTestContainer, type TestFakes } from "./test-container";

// In the browser, with no arguments. On the server, with the request's cookies, so the
// session it renders is the visitor's own.
export function createContainer(requestCookies: RequestCookieJar | null = null): Container {
  return process.env.NODE_ENV === "production"
    ? createProductionContainer(requestCookies)
    : createLocalContainer(requestCookies);
}
