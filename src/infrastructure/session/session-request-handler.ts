import { decodeSession, expiredSessionCookie, sessionCookie } from "./session-cookie";

// The server half of the session endpoint: PUT signs in, DELETE signs out. It only sets
// the cookie; deciding who may sign in is the SignIn use case's job.
export async function handleSessionRequest(request: Request): Promise<Response> {
  if (request.method === "DELETE") return withCookie(expiredSessionCookie());
  if (request.method !== "PUT") return new Response(null, { status: 405 });
  const session = decodeSession(encodeURIComponent(await request.text()));
  if (session === null) return new Response(null, { status: 400 });
  return withCookie(sessionCookie(session));
}

function withCookie(cookie: string): Response {
  return new Response(null, { status: 204, headers: { "Set-Cookie": cookie } });
}
