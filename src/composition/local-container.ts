import { assembleContainer, type Container } from "./container";
import { type RequestCookies, shopPorts } from "./shop-port";

export function createLocalContainer(requestCookies: RequestCookies | null = null): Container {
  return assembleContainer(shopPorts(requestCookies));
}
