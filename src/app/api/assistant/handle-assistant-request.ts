import type { Container } from "@/composition";

export async function handleAssistantRequest(
  request: Request,
  container: Container,
): Promise<Response> {
  const text = readText(await readJson(request));
  if (text === null)
    return Response.json({ error: "Expected a JSON body with a text field" }, { status: 400 });
  try {
    return Response.json(await container.rephraseQuery.execute({ text }));
  } catch (error) {
    console.error(
      "Query assistant failed:",
      error instanceof Error ? error.message : String(error),
    );
    return Response.json({ query: null });
  }
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function readText(body: unknown): string | null {
  if (typeof body !== "object" || body === null || !("text" in body)) return null;
  return typeof body.text === "string" ? body.text : null;
}
