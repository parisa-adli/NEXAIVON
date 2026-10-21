import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { validateEnv } = require("../utils/env.js");

const SERVER_URL = "http://localhost:5000";

describe("validateEnv (startup checks)", () => {
  it("refuses to start when NODE_ENV is missing", () => {
    expect(() => validateEnv({ SERVER_URL })).toThrow(/NODE_ENV/);
  });

  it("refuses to start when NODE_ENV is empty", () => {
    expect(() => validateEnv({ NODE_ENV: "  ", SERVER_URL })).toThrow(/NODE_ENV/);
  });

  it("accepts a set NODE_ENV", () => {
    expect(() => validateEnv({ NODE_ENV: "production", SERVER_URL })).not.toThrow();
    expect(() => validateEnv({ NODE_ENV: "development", SERVER_URL })).not.toThrow();
  });

  // Upload URLs are built from it and stored in the database (FR-API-17).
  it.each([undefined, "  "])("refuses to start when SERVER_URL is %j", (value) => {
    expect(() =>
      validateEnv({ NODE_ENV: "production", SERVER_URL: value })
    ).toThrow(/SERVER_URL/);
  });
});
