import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Build output (not part of default ignores since distDir was customized)
    "dist/**",
    // Vendored ffmpeg.wasm core, copied by scripts/copy-ffmpeg-core.mjs
    "public/ffmpeg/**",
  ]),
]);

export default eslintConfig;
