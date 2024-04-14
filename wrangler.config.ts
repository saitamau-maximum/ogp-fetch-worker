import { defineConfig } from "twrangler";

export default defineConfig({
  name: "ogp-fetch-worker",
  main: "src/index.ts",
  compatibility_date: "2024-04-03",
  tsconfig: "tsconfig.build.json",
  compatibility_flags: ["nodejs_compat"],
});
