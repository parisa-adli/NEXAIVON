import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { CategoryModel } = require("../app/models/category.js");
const { ProductModel } = require("../app/models/product.js");

setupTestDb();

describe("GET /api/product/list (guest)", () => {
  it("returns an empty list when there are no products", async () => {
    const res = await request(createApp()).get("/api/product/list");

    expect(res.status).toBe(200);
    expect(res.body.data.products).toEqual([]);
  });

  it("returns a product with its category populated and no likes", async () => {
    const category = await CategoryModel.create({
      title: "گوشی موبایل",
      englishTitle: "smartphones",
      description: "Smartphones",
    });
    await ProductModel.create({
      title: "Test phone",
      description: "A phone for tests",
      slug: "test-phone",
      category: category._id,
      imageLink: "uploads/test-phone.png",
      price: 1000,
      offPrice: 900,
      discount: 10,
      brand: "TestBrand",
      countInStock: 5,
    });

    const res = await request(createApp()).get("/api/product/list");

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
    const [product] = res.body.data.products;
    expect(product.slug).toBe("test-phone");
    expect(product.category).toMatchObject({
      title: "گوشی موبایل",
      englishTitle: "smartphones",
    });
    expect(product).not.toHaveProperty("likes");
    expect(product.likesCount).toBe(0);
    expect(product.isLiked).toBe(false);
  });
});

describe("GET /api/product/list?category=", () => {
  async function seedPhoneAndWatch() {
    const [phones, watches] = await CategoryModel.create([
      { title: "گوشی موبایل", englishTitle: "smartphones", description: "Phones" },
      { title: "ساعت هوشمند", englishTitle: "smartwatches", description: "Watches" },
    ]);
    const base = {
      description: "A product for tests",
      imageLink: "uploads/test.png",
      price: 1000,
      offPrice: 1000,
      brand: "TestBrand",
      countInStock: 5,
    };
    await ProductModel.create([
      { ...base, title: "Phone", slug: "phone", category: phones._id },
      { ...base, title: "Watch", slug: "watch", category: watches._id },
    ]);
  }

  it("returns 200 with no products for an unknown category", async () => {
    await seedPhoneAndWatch();

    const res = await request(createApp()).get(
      "/api/product/list?category=unknown"
    );

    expect(res.status).toBe(200);
    expect(res.body.data.products).toEqual([]);
  });

  it("ignores unknown categories mixed with known ones", async () => {
    await seedPhoneAndWatch();

    const res = await request(createApp()).get(
      "/api/product/list?category=unknown,smartwatches"
    );

    expect(res.status).toBe(200);
    expect(res.body.data.products.map((p) => p.slug)).toEqual(["watch"]);
  });

  it("does not apply a query operator passed as category", async () => {
    await seedPhoneAndWatch();

    const res = await request(createApp()).get(
      "/api/product/list?category[$ne]=smartphones"
    );

    expect(res.status).toBe(200);
    expect(res.body.data.products).toEqual([]);
  });
});
