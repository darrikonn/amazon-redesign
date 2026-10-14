import {
  CatalogProductRepository,
  DemoIdentityProvider,
  SessionCartLineRepository,
} from "@/infrastructure";
import { assembleContainer, type Container } from "./container";

export function createLocalContainer(): Container {
  return assembleContainer({
    products: new CatalogProductRepository(),
    cartLines: new SessionCartLineRepository(),
    identity: new DemoIdentityProvider(),
  });
}
