import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// The dependency rule of ADR 0004, checked on every lint rather than left to review. Tests
// are wired through the test container, so they are a composition root and exempt.
const TESTS = ["**/__test__/**"];

function forbidding(...packages: readonly string[]) {
  return {
    patterns: packages.map((name) => ({
      group: [name, `${name}/**`],
      message: "ADR 0004: dependencies point inward; this layer may not import that one.",
    })),
  };
}

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
  {
    files: ["src/core/**/*.ts"],
    ignores: TESTS,
    rules: {
      "no-restricted-imports": [
        "error",
        forbidding(
          "@/component",
          "@/use-case",
          "@/infrastructure",
          "@/composition",
          "@/app",
          "react",
          "next",
        ),
      ],
    },
  },
  {
    files: ["src/component/**/*.ts"],
    ignores: TESTS,
    rules: {
      "no-restricted-imports": [
        "error",
        forbidding("@/use-case", "@/infrastructure", "@/composition", "@/app", "react", "next"),
      ],
    },
  },
  {
    files: ["src/use-case/**/*.ts"],
    ignores: TESTS,
    rules: {
      "no-restricted-imports": [
        "error",
        forbidding("@/infrastructure", "@/composition", "@/app", "react", "next"),
      ],
    },
  },
  {
    files: ["src/infrastructure/**/*.ts"],
    ignores: TESTS,
    rules: {
      "no-restricted-imports": [
        "error",
        forbidding("@/component", "@/use-case", "@/composition", "@/app"),
      ],
    },
  },
  {
    files: ["src/app/**/*.ts", "src/app/**/*.tsx", "src/proxy.ts"],
    ignores: TESTS,
    rules: {
      "no-restricted-imports": ["error", forbidding("@/component", "@/infrastructure")],
      // The delivery layer reads the use cases' and core's shapes, never their code.
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "@/use-case", allowTypeImports: true, message: "ADR 0004: types only." },
            { name: "@/core", allowTypeImports: true, message: "ADR 0004: types only." },
          ],
        },
      ],
    },
  },
]);
