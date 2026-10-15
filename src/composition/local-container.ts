import type { RequestCookieJar } from "@/infrastructure";
import { assembleContainer, type Container } from "./container";
import { shopAdapters } from "./shop-adapter";

export function createLocalContainer(requestCookies: RequestCookieJar | null = null): Container {
  return assembleContainer(shopAdapters(requestCookies));
}
