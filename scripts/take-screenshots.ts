import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "playwright-core";
import { STARTER_QUERIES } from "@/component";

// Renders every storefront state at desktop and phone width against a production build.
// Run `yarn build` first. Uses the installed Google Chrome, so nothing is downloaded.
async function main(): Promise<void> {
  if (!existsSync(path.join(ROOT, ".next/BUILD_ID")))
    throw new Error("No production build found; run `yarn build` first");
  const server = startServer();
  try {
    await waitUntilReady(BASE_URL);
    await captureAll();
  } finally {
    server.kill();
  }
}

type ScreenState = {
  name: string;
  address: string;
  hasOpenProduct: boolean;
};

const ROOT = path.resolve(import.meta.dirname, "..");
const OUTPUT_DIRECTORY = path.join(ROOT, "docs/screenshots");
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;
const WIDTHS = [1440, 390] as const;
const VIEWPORT_HEIGHT = 900;
const READY_TIMEOUT_IN_MILLISECONDS = 30_000;
const READY_POLL_IN_MILLISECONDS = 250;

const [firstExample = "", ...otherExamples] = STARTER_QUERIES;
const PRODUCT_WITH_PHOTOS = "dummyjson-0094";

const STATES: readonly ScreenState[] = [
  searchState("home", ""),
  searchState("results", firstExample),
  searchState("headphones", "headphones"),
  searchState("laptops", "laptops"),
  searchState("none", "red laptop under $1500"),
  { ...searchState("product", "watches", PRODUCT_WITH_PHOTOS), hasOpenProduct: true },
  pageState("deals", "/deals"),
  pageState("sign-in", "/sign-in"),
  pageState("cart", "/cart"),
  ...otherExamples.map((query, index) => searchState(`example-${index + 2}`, query)),
];

// The address a shopper would share: the search, and the product open over it.
function searchState(name: string, text: string, productId: string | null = null): ScreenState {
  const parameters = new URLSearchParams();
  if (text !== "") parameters.set("q", text);
  if (productId !== null) parameters.set("product", productId);
  const query = parameters.toString();
  return { name, address: query === "" ? "/" : `/?${query}`, hasOpenProduct: false };
}

function pageState(name: string, address: string): ScreenState {
  return { name, address, hasOpenProduct: false };
}

function startServer(): ChildProcess {
  return spawn(path.join(ROOT, "node_modules/.bin/next"), ["start", "-p", String(PORT)], {
    cwd: ROOT,
    stdio: "ignore",
  });
}

async function waitUntilReady(url: string): Promise<void> {
  const deadline = Date.now() + READY_TIMEOUT_IN_MILLISECONDS;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, READY_POLL_IN_MILLISECONDS));
  }
  throw new Error(`The production server did not answer at ${url}`);
}

async function captureAll(): Promise<void> {
  await mkdir(OUTPUT_DIRECTORY, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: VIEWPORT_HEIGHT },
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      for (const state of STATES) await capture(page, state, width);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

// An open product modal covers the window, so it is captured at window size; every other
// state is captured as the whole page.
async function capture(page: Page, state: ScreenState, width: number): Promise<void> {
  await page.goto(`${BASE_URL}${state.address}`, { waitUntil: "networkidle" });
  if (state.hasOpenProduct) await page.waitForSelector("dialog[open] dt");
  else await scrollThrough(page);
  // Behind an open modal the page cannot scroll, so its lazy images below the window never
  // load; only the images that will be in the picture are waited for.
  const scope = state.hasOpenProduct ? "dialog" : "body";
  await page.waitForFunction(
    (selector) =>
      [...document.querySelectorAll(`${selector} img`)].every(
        (image) => image instanceof HTMLImageElement && image.complete,
      ),
    scope,
  );
  const file = path.join(OUTPUT_DIRECTORY, `${state.name}-${width}.png`);
  await page.screenshot({ path: file, fullPage: !state.hasOpenProduct });
  console.info(`Saved ${path.relative(ROOT, file)}`);
}

// A full-page picture includes images far below the window, which lazy loading only
// starts once they come near; scrolling through once starts them all.
async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async (pauseInMilliseconds) => {
    for (let top = 0; top < document.body.scrollHeight; top += window.innerHeight) {
      window.scrollTo(0, top);
      await new Promise((resolve) => setTimeout(resolve, pauseInMilliseconds));
    }
    window.scrollTo(0, 0);
  }, SCROLL_PAUSE_IN_MILLISECONDS);
}

const SCROLL_PAUSE_IN_MILLISECONDS = 60;

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
