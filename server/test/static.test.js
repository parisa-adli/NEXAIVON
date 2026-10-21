import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");

describe("static files (NFR-15)", () => {
  let uploadsDir;

  beforeAll(async () => {
    uploadsDir = await mkdtemp(path.join(tmpdir(), "uploads-"));
    await mkdir(path.join(uploadsDir, "seed"));
    await writeFile(path.join(uploadsDir, "seed", "phone.png"), "png bytes");
    await writeFile(path.join(uploadsDir, ".secret"), "secret");
  });

  afterAll(async () => {
    await rm(uploadsDir, { recursive: true, force: true });
  });

  it.each(["/app/app.js", "/index.js", "/package.json", "/.env.example"])(
    "does not serve source path %s",
    async (url) => {
      const res = await request(createApp({ uploadsDir })).get(url);

      expect(res.status).toBe(404);
    }
  );

  it.each([
    "/uploads/..%2fapp%2fapp.js",
    "/uploads/%2e%2e/package.json",
    "/uploads/.secret",
    "/uploads/seed/",
  ])("does not serve %s through the uploads folder", async (url) => {
    const res = await request(createApp({ uploadsDir })).get(url);

    expect(res.status).toBe(404);
  });

  it("serves a file from the uploads folder at /uploads", async () => {
    const res = await request(createApp({ uploadsDir }))
      .get("/uploads/seed/phone.png")
      .buffer(true);

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("image/png");
    expect(res.body.toString()).toBe("png bytes");
  });
});
