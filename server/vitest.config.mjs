import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.js"],
    setupFiles: ["test/helpers/env.js"],
    // The first run downloads the mongod binary for mongodb-memory-server.
    hookTimeout: 60_000,
  },
});
