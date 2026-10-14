import { createServerContainer } from "@/composition/server";
import { handleAssistantRequest } from "./handle-assistant-request";

export async function POST(request: Request): Promise<Response> {
  return handleAssistantRequest(request, createServerContainer());
}
