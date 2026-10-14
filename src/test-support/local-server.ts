import { createServer, type IncomingHttpHeaders } from "node:http";

export type RecordedRequest = {
  method: string;
  path: string;
  headers: IncomingHttpHeaders;
  body: unknown;
};

export type LocalServer = {
  url: string;
  requests: RecordedRequest[];
  respondWith: (status: number, body: unknown) => void;
  close: () => Promise<void>;
};

export async function startLocalServer(): Promise<LocalServer> {
  const requests: RecordedRequest[] = [];
  let reply: { status: number; body: unknown } = { status: 200, body: {} };
  const server = createServer((request, response) => {
    const chunks: Buffer[] = [];
    request.on("data", (chunk: Buffer) => chunks.push(chunk));
    request.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      requests.push({
        method: request.method ?? "",
        path: request.url ?? "",
        headers: request.headers,
        body: raw === "" ? null : JSON.parse(raw),
      });
      response.writeHead(reply.status, { "content-type": "application/json" });
      response.end(JSON.stringify(reply.body));
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (address === null || typeof address === "string") throw new Error("Local server has no port");
  return {
    url: `http://127.0.0.1:${address.port}`,
    requests,
    respondWith: (status, body) => {
      reply = { status, body };
    },
    close: () => new Promise((resolve) => server.close(() => resolve())),
  };
}
