import {
  InMemoryCartLineRepository,
  InMemoryIdentityProvider,
  InMemoryProductDetailsRepository,
  InMemoryProductRepository,
} from "@/infrastructure";
import { assembleContainer, type Container } from "./container";

export type TestFakes = {
  products: InMemoryProductRepository;
  productDetails: InMemoryProductDetailsRepository;
  cartLines: InMemoryCartLineRepository;
  identity: InMemoryIdentityProvider;
};

export function createTestContainer(): { container: Container; fakes: TestFakes } {
  const fakes: TestFakes = {
    products: new InMemoryProductRepository(),
    productDetails: new InMemoryProductDetailsRepository(),
    cartLines: new InMemoryCartLineRepository(),
    identity: new InMemoryIdentityProvider(),
  };
  return { container: assembleContainer(fakes), fakes };
}
