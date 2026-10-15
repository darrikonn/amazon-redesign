import type { RequestCookieJar } from "@/infrastructure";
import { assembleContainer, type Container } from "./container";
import { shopAdapters } from "./shop-adapter";

export function createProductionContainer(
  requestCookies: RequestCookieJar | null = null,
): Container {
  return assembleContainer(shopAdapters(requestCookies));
}
