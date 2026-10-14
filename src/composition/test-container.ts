import {
  InMemoryCartLineRepository,
  InMemoryIdentityProvider,
  InMemoryProductRepository,
  InMemoryQueryAssistant,
} from "@/infrastructure";
import { assembleContainer, type Container } from "./container";

export type TestFakes = {
  products: InMemoryProductRepository;
  cartLines: InMemoryCartLineRepository;
  identity: InMemoryIdentityProvider;
  assistant: InMemoryQueryAssistant;
};

export function createTestContainer(): { container: Container; fakes: TestFakes } {
  const fakes: TestFakes = {
    products: new InMemoryProductRepository(),
    cartLines: new InMemoryCartLineRepository(),
    identity: new InMemoryIdentityProvider(),
    assistant: new InMemoryQueryAssistant(),
  };
  return { container: assembleContainer(fakes), fakes };
}
