import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: ["packages/shared", "apps/api", "apps/web"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
    },
  },
});
