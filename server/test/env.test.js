import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { validateEnv } = require("../utils/env.js");

describe("validateEnv (startup checks)", () => {
  it("refuses to start when NODE_ENV is missing", () => {
    expect(() => validateEnv({})).toThrow(/NODE_ENV/);
  });

  it("refuses to start when NODE_ENV is empty", () => {
    expect(() => validateEnv({ NODE_ENV: "  " })).toThrow(/NODE_ENV/);
  });

  it("accepts a set NODE_ENV", () => {
    expect(() => validateEnv({ NODE_ENV: "production" })).not.toThrow();
    expect(() => validateEnv({ NODE_ENV: "development" })).not.toThrow();
  });
});
