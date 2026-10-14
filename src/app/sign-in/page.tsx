import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createContainer } from "@/composition";
import type { RawSearchParameters } from "../_ui/search-url";
import { SignInForm } from "../_ui/sign-in-form";
import { safeReturnPath } from "../_ui/sign-in-href";

export const metadata: Metadata = { title: "Sign in" };

type SignInPageProps = {
  searchParams: Promise<RawSearchParameters>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;
  const returnPath = safeReturnPath(Array.isArray(next) ? next[0] : next);
  const { shopper } = await createContainer(await cookies()).viewSession.execute();
  if (shopper !== null) redirect(returnPath);
  return <SignInForm returnPath={returnPath} />;
}
