import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { buildCatalog, CATALOG_OVERRIDES } from "@/component";
import type { ProductSource } from "@/core";

// Composition root for the catalogue: the only place that touches the network.
// `yarn catalog:build` fetches and rebuilds; `yarn catalog:build --from-raw` rebuilds
// from the committed raw response without a network call.
async function main(): Promise<void> {
  const fromRaw = process.argv.includes("--from-raw");
  const { source, rawText } = fromRaw ? await readCommittedRaw() : await fetchFirstReachable();
  if (!fromRaw) await writeText(rawPath(source), rawText);
  const catalog = buildCatalog(source, JSON.parse(rawText), CATALOG_OVERRIDES);
  await writeText(CATALOG_PATH, toJson(catalog.products));
  await writeText(VOCABULARY_PATH, toJson(catalog.vocabulary));
  console.info(
    `Built ${catalog.products.length} products from ${source}${fromRaw ? " (committed raw data)" : ""}.`,
  );
}

type SourceEndpoint = {
  source: ProductSource;
  url: string;
};

const SOURCES: readonly SourceEndpoint[] = [
  { source: "dummyjson", url: "https://dummyjson.com/products?limit=0" },
  { source: "fakestore", url: "https://fakestoreapi.com/products" },
];

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW_DIRECTORY = path.join(ROOT, "src/infrastructure/product/data/raw");
const CATALOG_PATH = path.join(ROOT, "src/infrastructure/product/data/catalog.json");
const VOCABULARY_PATH = path.join(ROOT, "src/component/catalog-vocabulary/vocabulary.json");
const FETCH_TIMEOUT_IN_MILLISECONDS = 20_000;

async function readCommittedRaw(): Promise<{ source: ProductSource; rawText: string }> {
  for (const { source } of SOURCES) {
    try {
      return { source, rawText: await readFile(rawPath(source), "utf8") };
    } catch {
      // Try the next source's committed file.
    }
  }
  throw new Error(`No committed raw response in ${RAW_DIRECTORY}; run without --from-raw first`);
}

async function fetchFirstReachable(): Promise<{ source: ProductSource; rawText: string }> {
  const failures: string[] = [];
  for (const { source, url } of SOURCES) {
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_IN_MILLISECONDS),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return { source, rawText: await response.text() };
    } catch (error) {
      failures.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  throw new Error(`No catalogue source was reachable:\n${failures.join("\n")}`);
}

function rawPath(source: ProductSource): string {
  return path.join(RAW_DIRECTORY, `${source}.json`);
}

async function writeText(filePath: string, text: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, text, "utf8");
}

function toJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
