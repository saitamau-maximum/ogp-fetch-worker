import { defineConfig, mergeConfig } from "vitest/config";
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default mergeConfig(
  defineConfig({
    test: {
      globals: true,
    },
  }),
  defineWorkersConfig({
    test: {
      poolOptions: {
        workers: {
          wrangler: { configPath: "./wrangler.toml" },
        },
      },
    },
  })
);
