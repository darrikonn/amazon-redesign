import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` throws outside a React server build; tests run server code directly.
      "server-only": fileURLToPath(new URL("./src/test-support/empty-module.ts", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/__test__/**/*.test.ts", "src/**/__test__/**/*.test.tsx"],
    environment: "node",
  },
});
