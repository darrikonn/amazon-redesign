import { createServer, type IncomingMessage } from "node:http";
import type { AddressInfo } from "node:net";

export type StandInRequest = {
  method: string;
  path: string;
  contentType: string | undefined;
  body: string;
};

export type SessionEndpointStandIn = {
  url: string;
  requests: StandInRequest[];
  answerWith(status: number): void;
  close(): Promise<void>;
};

// A local stand-in for the shop's own /api/session route, so the fetch adapter is tested
// against a real HTTP exchange: it records each request and answers with a chosen status.
export async function startSessionEndpointStandIn(): Promise<SessionEndpointStandIn> {
  const requests: StandInRequest[] = [];
  let status = 204;
  const server = createServer(async (request, response) => {
    requests.push({
      method: request.method ?? "",
      path: request.url ?? "",
      contentType: request.headers["content-type"],
      body: await bodyOf(request),
    });
    response.writeHead(status).end();
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    url: `http://127.0.0.1:${portOf(server.address())}/api/session`,
    requests,
    answerWith(next) {
      status = next;
    },
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}

async function bodyOf(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

function portOf(address: AddressInfo | string | null): number {
  if (address === null || typeof address === "string") throw new Error("The stand-in has no port");
  return address.port;
}
