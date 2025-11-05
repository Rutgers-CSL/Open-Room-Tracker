import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",      // sets up a node js environment rather than a browser environment
    globals: true,              // enables global variables like describe, it, expect etc. rather than importing from vitest
    include: ["tests/**/*.test.js"],
    coverage: { provider: "v8" }
  }
});
