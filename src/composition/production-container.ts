import {
  CatalogProductDetailsRepository,
  CatalogProductRepository,
  DemoIdentityProvider,
  SessionCartLineRepository,
} from "@/infrastructure";
import { assembleContainer, type Container } from "./container";

export function createProductionContainer(): Container {
  return assembleContainer({
    products: new CatalogProductRepository(),
    productDetails: new CatalogProductDetailsRepository(),
    cartLines: new SessionCartLineRepository(),
    identity: new DemoIdentityProvider(),
  });
}
