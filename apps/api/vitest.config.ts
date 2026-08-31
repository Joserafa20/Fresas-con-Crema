import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: "postgresql://user:pass@localhost:5432/test",
      PORT: "3001",
      CORS_ORIGIN: "http://localhost:3000",
    },
  },
});
