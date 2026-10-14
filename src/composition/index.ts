import type { Container } from "./container";
import { createLocalContainer } from "./local-container";
import { createProductionContainer } from "./production-container";

export type { Container } from "./container";
export { createLocalContainer } from "./local-container";
export { createProductionContainer } from "./production-container";
export { createTestContainer, type TestFakes } from "./test-container";

export function createContainer(): Container {
  return process.env.NODE_ENV === "production"
    ? createProductionContainer()
    : createLocalContainer();
}
