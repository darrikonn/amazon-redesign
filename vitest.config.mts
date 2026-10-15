import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@scripts": fileURLToPath(new URL("./scripts", import.meta.url)),
    },
  },
  test: {
    include: [
      "src/**/__test__/**/*.test.ts",
      "src/**/__test__/**/*.test.tsx",
      "scripts/**/__test__/**/*.test.ts",
    ],
    environment: "node",
  },
});
