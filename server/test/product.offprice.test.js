import { createRequire } from "node:module";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { signedInCookie } from "./helpers/auth.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { CategoryModel } = require("../app/models/category.js");

setupTestDb();

let app;
let adminCookie;
let category;

beforeEach(async () => {
  app = createApp();
  adminCookie = await signedInCookie("ADMIN");
  category = await CategoryModel.create({
    title: "گوشی موبایل",
    englishTitle: "smartphones",
    description: "Smartphones",
  });
});

function productBody(overrides = {}) {
  return {
    title: "Test phone",
    description: "A phone for tests",
    slug: "test-phone",
    brand: "TestBrand",
    countInStock: 5,
    imageLink: "uploads/test-phone.png",
    category: category._id.toString(),
    price: 1000000,
    discount: 15,
    ...overrides,
  };
}

async function addProduct(overrides) {
  const res = await request(app)
    .post("/api/admin/product/add")
    .set("Cookie", adminCookie)
    .send(productBody(overrides));
  expect(res.status).toBe(201);
  return res.body.data.product._id;
}

async function storedOffPrice(id) {
  const res = await request(app).get(`/api/product/${id}`);
  expect(res.status).toBe(200);
  return res.body.data.product.offPrice;
}

describe("offPrice is computed by the server (AC-CART-11)", () => {
  it("stores 850,000 for price 1,000,000 with a 15% discount", async () => {
    const id = await addProduct({ price: 1000000, discount: 15 });

    expect(await storedOffPrice(id)).toBe(850000);
  });

  it("stores offPrice = price without a discount, ignoring a client offPrice", async () => {
    const id = await addProduct({ price: 1000000, discount: 0, offPrice: 1 });

    expect(await storedOffPrice(id)).toBe(1000000);
  });

  it("recomputes offPrice when an update changes only the price", async () => {
    const id = await addProduct({ price: 1000000, discount: 15 });

    const res = await request(app)
      .patch(`/api/admin/product/update/${id}`)
      .set("Cookie", adminCookie)
      .send({ price: 2000000, offPrice: 1 });

    expect(res.status).toBe(200);
    expect(await storedOffPrice(id)).toBe(1700000);
  });

  it("recomputes offPrice when only the discount changes", async () => {
    const id = await addProduct({ price: 1000000, discount: 15 });

    const res = await request(app)
      .patch(`/api/admin/product/change-discount/${id}`)
      .set("Cookie", adminCookie)
      .send({ discount: 20 });

    expect(res.status).toBe(200);
    expect(await storedOffPrice(id)).toBe(800000);
  });

  it("rounds to the nearest whole Toman", async () => {
    const id = await addProduct({ price: 1001, discount: 15 });

    // 1001 × 0.85 = 850.85: rounds up, not truncated.
    expect(await storedOffPrice(id)).toBe(851);
  });
});
