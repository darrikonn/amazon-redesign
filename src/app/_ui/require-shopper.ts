import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createContainer } from "@/composition";
import type { ShopperView } from "@/use-case";
import { signInHref } from "./sign-in-href";

// Account pages are for a signed-in shopper; anyone else signs in and comes back here.
export async function requireShopper(returnPath: string): Promise<ShopperView> {
  const { shopper } = await createContainer(await cookies()).viewSession.execute();
  if (shopper === null) redirect(signInHref(returnPath));
  return shopper;
}
