import type { Linter } from "eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// The dependency rule of ADR 0004, checked on every lint rather than left to review. Each
// layer is named both by its alias and by any relative path into it, so neither way around
// the rule passes. Tests are exempt: unit tests import only what they test, and the rest are
// wired through the test container, a composition root.
const TESTS = ["**/__test__/**"];
const SOURCE = "**/*.{ts,tsx}";

const LAYERS = {
  core: ["@/core", "**/core"],
  component: ["@/component", "**/component"],
  useCase: ["@/use-case", "**/use-case"],
  infrastructure: ["@/infrastructure", "**/infrastructure"],
  composition: ["@/composition", "**/composition"],
  delivery: ["@/app", "**/app"],
  testSupport: ["@/test-support", "**/test-support"],
  frameworks: ["react", "react-dom", "next"],
  platform: ["node:*"],
} as const;

type Layer = keyof typeof LAYERS;

function forbidding(...layers: readonly Layer[]) {
  return {
    patterns: layers.map((layer) => ({
      group: LAYERS[layer].flatMap((name) => [name, `${name}/**`]),
      message: "ADR 0004: dependencies point inward; this layer may not import that one.",
    })),
  };
}

function layer(directory: string, ...forbidden: readonly Layer[]): Linter.Config {
  return {
    files: [`src/${directory}/${SOURCE}`],
    ignores: TESTS,
    rules: { "no-restricted-imports": ["error", forbidding(...forbidden)] },
  };
}

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  layer(
    "core",
    "component",
    "useCase",
    "infrastructure",
    "composition",
    "delivery",
    "testSupport",
    "frameworks",
    "platform",
  ),
  layer(
    "component",
    "useCase",
    "infrastructure",
    "composition",
    "delivery",
    "testSupport",
    "frameworks",
    "platform",
  ),
  layer(
    "use-case",
    "infrastructure",
    "composition",
    "delivery",
    "testSupport",
    "frameworks",
    "platform",
  ),
  layer("infrastructure", "component", "useCase", "composition", "delivery", "testSupport"),
  layer("composition", "delivery", "testSupport"),
  {
    files: [`src/app/${SOURCE}`, "src/proxy.ts"],
    ignores: TESTS,
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...forbidding("component", "infrastructure", "testSupport").patterns,
            {
              group: [
                "@/use-case/**",
                "@/core/**",
                "@/composition/**",
                "../**/use-case",
                "../**/use-case/**",
                "../**/core",
                "../**/core/**",
                "../**/composition",
                "../**/composition/**",
              ],
              message: "ADR 0010: reach another layer through its index, never into its files.",
            },
          ],
        },
      ],
      // Delivery reads the use cases' and core's shapes, never their code, and obtains the
      // container from composition, never the test wiring.
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@/use-case", allowTypeImports: true, message: "ADR 0004: types only." },
            { name: "@/core", allowTypeImports: true, message: "ADR 0004: types only." },
            {
              name: "@/composition",
              importNames: [
                "createTestContainer",
                "createLocalContainer",
                "createProductionContainer",
              ],
              message: "ADR 0004: delivery obtains the container through createContainer.",
            },
          ],
        },
      ],
    },
  },
]);
