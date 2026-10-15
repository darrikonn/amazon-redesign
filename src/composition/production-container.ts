import type { RequestCookieJar } from "@/infrastructure";
import { assembleContainer, type Container } from "./container";
import { shopPorts } from "./shop-port";

export function createProductionContainer(
  requestCookies: RequestCookieJar | null = null,
): Container {
  return assembleContainer(shopPorts(requestCookies));
}
