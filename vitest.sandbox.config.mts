import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Runs only the sandbox tests, which call real external systems with real secrets.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./src/test-support/empty-module.ts", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/__test__/sandbox/**/*.test.ts"],
    environment: "node",
    testTimeout: 60_000,
  },
});
