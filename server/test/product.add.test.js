import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { signedInCookie } from "./helpers/auth.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");

setupTestDb();

function addProduct(cookie, category) {
  return request(createApp())
    .post("/api/admin/product/add")
    .set("Cookie", cookie)
    .send({
      title: "گوشی تست",
      description: "توضیحات",
      slug: "test-phone",
      brand: "Apple",
      price: 1000,
      countInStock: 3,
      imageLink: "/a.png",
      tags: [],
      category,
    });
}

describe("POST /api/admin/product/add", () => {
  it("accepts an all-digit category id, like the seed's", async () => {
    const res = await addProduct(await signedInCookie("ADMIN"), "000000000000000000000101");
    expect(res.status).toBe(201);
  });

  it("rejects a malformed category id", async () => {
    const res = await addProduct(await signedInCookie("ADMIN"), "not-an-id");
    expect(res.status).toBe(400);
  });
});
