import {
  FixedClock,
  InMemoryCartLineRepository,
  InMemoryOrderRepository,
  InMemoryProductDetailsRepository,
  InMemoryProductRepository,
  InMemorySavedItemRepository,
  InMemorySessionStore,
} from "@/infrastructure";
import { assembleContainer, type Container } from "./container";

export type TestFakes = {
  products: InMemoryProductRepository;
  productDetails: InMemoryProductDetailsRepository;
  cartLines: InMemoryCartLineRepository;
  orders: InMemoryOrderRepository;
  savedItems: InMemorySavedItemRepository;
  sessions: InMemorySessionStore;
  clock: FixedClock;
};

export function createTestContainer(): { container: Container; fakes: TestFakes } {
  const clock = new FixedClock();
  const fakes: TestFakes = {
    products: new InMemoryProductRepository(),
    productDetails: new InMemoryProductDetailsRepository(),
    cartLines: new InMemoryCartLineRepository(clock),
    orders: new InMemoryOrderRepository(clock),
    savedItems: new InMemorySavedItemRepository(clock),
    sessions: new InMemorySessionStore(),
    clock,
  };
  return { container: assembleContainer(fakes), fakes };
}
