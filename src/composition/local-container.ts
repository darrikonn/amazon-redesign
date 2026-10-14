import type { QueryAssistant } from "@/core";
import {
  CatalogProductRepository,
  DemoIdentityProvider,
  HttpQueryAssistant,
  SessionCartLineRepository,
} from "@/infrastructure";
import { assembleContainer, type Container } from "./container";
import { ASSISTANT_ENDPOINT } from "./endpoint";

export function createLocalContainer(
  assistant: QueryAssistant = new HttpQueryAssistant(ASSISTANT_ENDPOINT),
): Container {
  return assembleContainer({
    products: new CatalogProductRepository(),
    cartLines: new SessionCartLineRepository(),
    identity: new DemoIdentityProvider(),
    assistant,
  });
}
