import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    // Isolate each test file to avoid module cache issues between tests
    isolate: true,
    coverage: {
      provider: "v8",
      include: ["lib/prices.ts", "app/api/cron/**", "app/api/admin/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
