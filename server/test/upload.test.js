import { mkdtemp, readdir, rm } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { signedInCookie } from "./helpers/auth.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");

setupTestDb();

// Smallest valid file headers for each format; the upload only sniffs them.
const PNG = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
const JPEG = Buffer.from("ffd8ffe000104a46494600", "hex");
const WEBP = Buffer.concat([
  Buffer.from("RIFF"),
  Buffer.from("24000000", "hex"),
  Buffer.from("WEBPVP8 "),
]);

let uploadsDir;
let app;

beforeEach(async () => {
  uploadsDir = await mkdtemp(path.join(tmpdir(), "uploads-"));
  app = createApp({ uploadsDir });
});

afterEach(async () => {
  await rm(uploadsDir, { recursive: true, force: true });
});

function upload(cookie, file, filename = "photo.png") {
  const req = request(app).post("/api/admin/upload/image");
  if (cookie) req.set("Cookie", cookie);
  return req.attach("image", file, filename);
}

describe("POST /api/admin/upload/image (FR-API-17)", () => {
  it("stores an admin's image and returns a public URL that serves it", async () => {
    const res = await upload(await signedInCookie("ADMIN"), PNG);

    expect(res.status).toBe(201);
    const { url } = res.body.data;
    expect(url).toMatch(/^http:\/\/localhost:5000\/uploads\/images\/[\w-]+\.png$/);

    const served = await request(app)
      .get(new URL(url).pathname)
      .buffer(true);
    expect(served.status).toBe(200);
    expect(served.headers["content-type"]).toBe("image/png");
    expect(Buffer.compare(served.body, PNG)).toBe(0);
  });

  it.each([
    ["JPEG", JPEG, "jpg"],
    ["WebP", WEBP, "webp"],
  ])("accepts a %s image and names it .%s", async (_, file, extension) => {
    const res = await upload(await signedInCookie("ADMIN"), file, "photo.png");

    expect(res.status).toBe(201);
    expect(res.body.data.url.endsWith(`.${extension}`)).toBe(true);
  });

  it("ignores a path-escaping client filename", async () => {
    const res = await upload(
      await signedInCookie("ADMIN"),
      PNG,
      "../../app/app.js"
    );

    expect(res.status).toBe(201);
    expect(res.body.data.url).toMatch(/\/uploads\/images\/[\w-]+\.png$/);
    expect(await readdir(path.join(uploadsDir, "images"))).toHaveLength(1);
    expect(await readdir(uploadsDir)).toEqual(["images"]);
  });

  it("rejects a request without a file with 400", async () => {
    const res = await request(app)
      .post("/api/admin/upload/image")
      .set("Cookie", await signedInCookie("ADMIN"))
      .field("note", "no file");

    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });

  it("rejects an image over 2 MB with 413 and stores nothing", async () => {
    const big = Buffer.concat([PNG, Buffer.alloc(2 * 1024 * 1024)]);

    const res = await upload(await signedInCookie("ADMIN"), big);

    expect(res.status).toBe(413);
    expect(res.body.message).toBeTruthy();
    expect(await readdir(uploadsDir, { recursive: true })).toEqual([]);
  });

  it("rejects a guest with 401", async () => {
    const res = await upload(null, PNG);

    expect(res.status).toBe(401);
  });

  it("rejects a non-admin with 403", async () => {
    const res = await upload(await signedInCookie("USER"), PNG);

    expect(res.status).toBe(403);
  });

  it.each([
    ["an SVG", Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"), "logo.svg"],
    ["HTML named .png", Buffer.from("<html><script>alert(1)</script>"), "x.png"],
    ["a script", Buffer.from("console.log(1)"), "app.js"],
  ])("rejects %s with 400 and stores nothing", async (_, file, filename) => {
    const res = await upload(await signedInCookie("ADMIN"), file, filename);

    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
    expect(await readdir(uploadsDir, { recursive: true })).toEqual([]);
  });
});
