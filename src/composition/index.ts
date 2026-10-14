import type { Container } from "./container";
import { createLocalContainer } from "./local-container";
import { createProductionContainer } from "./production-container";
import type { RequestCookies } from "./shop-port";

export type { Container } from "./container";
export { createLocalContainer } from "./local-container";
export { createProductionContainer } from "./production-container";
export { handleSessionRequest } from "./session-route";
export type { RequestCookies } from "./shop-port";
export { createTestContainer, type TestFakes } from "./test-container";

// In the browser, with no arguments. On the server, with the request's cookies, so the
// session it renders is the visitor's own.
export function createContainer(requestCookies: RequestCookies | null = null): Container {
  return process.env.NODE_ENV === "production"
    ? createProductionContainer(requestCookies)
    : createLocalContainer(requestCookies);
}
