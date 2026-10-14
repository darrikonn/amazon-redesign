import { cookies } from "next/headers";
import { createContainer } from "@/composition";

// Signing in and out ends here: the browser cannot write the session cookie itself
// (ADR 0030), so it asks the server to.
export async function PUT(request: Request): Promise<Response> {
  const body: unknown = await request.json().catch(() => null);
  const container = createContainer(await cookies());
  const result = await container.rememberSession.execute({
    email: textField(body, "email"),
    deliveryPostalCode: textField(body, "deliveryPostalCode"),
  });
  return new Response(null, { status: result.status === "remembered" ? 204 : 400 });
}

export async function DELETE(): Promise<Response> {
  await createContainer(await cookies()).signOut.execute();
  return new Response(null, { status: 204 });
}

function textField(body: unknown, name: string): string {
  if (typeof body !== "object" || body === null || !(name in body)) return "";
  const value: unknown = Reflect.get(body, name);
  return typeof value === "string" ? value : "";
}
