import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { CategoryModel } = require("../app/models/category.js");
const { ProductModel } = require("../app/models/product.js");
const mongoose = require("mongoose");

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

// Creates `count` products, one second apart, so createdAt order is known:
// "p1" is the oldest. `likes[i]` is how many likes product i+1 gets.
async function seedProducts(count, likes = []) {
  const category = await CategoryModel.create({
    title: "گوشی موبایل",
    englishTitle: "smartphones",
    description: "Phones",
  });
  const start = Date.parse("2026-01-01T00:00:00Z");
  const products = Array.from({ length: count }, (_, i) => ({
    title: `Product ${i + 1}`,
    description: "A product for tests",
    slug: `p${i + 1}`,
    category: category._id,
    imageLink: "uploads/test.png",
    price: 1000,
    offPrice: 1000,
    brand: "TestBrand",
    countInStock: 5,
    likes: Array.from({ length: likes[i] ?? 0 }, () => new mongoose.Types.ObjectId()),
    createdAt: new Date(start + i * 1000),
  }));
  // Insert newest first so natural order never matches the expected order.
  await ProductModel.insertMany(products.reverse());
}

describe("GET /api/product/list?limit=", () => {
  it("returns at most `limit` newest products with pagination", async () => {
    await seedProducts(6);

    const res = await request(createApp()).get(
      "/api/product/list?limit=4&sort=latest"
    );

    expect(res.status).toBe(200);
    expect(res.body.data.products.map((p) => p.slug)).toEqual([
      "p6",
      "p5",
      "p4",
      "p3",
    ]);
    expect(res.body.data.pagination).toEqual({
      page: 1,
      limit: 4,
      total: 6,
      totalPages: 2,
    });
  });

  it("returns the requested page of products", async () => {
    await seedProducts(6);

    const res = await request(createApp()).get(
      "/api/product/list?limit=4&sort=latest&page=2"
    );

    expect(res.status).toBe(200);
    expect(res.body.data.products.map((p) => p.slug)).toEqual(["p2", "p1"]);
    expect(res.body.data.pagination).toEqual({
      page: 2,
      limit: 4,
      total: 6,
      totalPages: 2,
    });
  });

  it("pages the popular ordering too", async () => {
    await seedProducts(4, [1, 3, 0, 2]);

    const res = await request(createApp()).get(
      "/api/product/list?sort=popular&limit=2&page=2"
    );

    expect(res.body.data.products.map((p) => p.slug)).toEqual(["p1", "p3"]);
  });

  it.each(["0", "-1", "abc", "1.5"])("rejects page=%s with 400", async (page) => {
    const res = await request(createApp()).get(
      `/api/product/list?limit=4&page=${page}`
    );

    expect(res.status).toBe(400);
  });

  it("returns every product and no pagination when limit is omitted", async () => {
    await seedProducts(6);

    const res = await request(createApp()).get("/api/product/list");

    expect(res.status).toBe(200);
    expect(res.body.data.products.map((p) => p.slug)).toEqual([
      "p1",
      "p2",
      "p3",
      "p4",
      "p5",
      "p6",
    ]);
    expect(res.body.data).not.toHaveProperty("pagination");
  });

  it.each(["0", "49", "abc", "2.5"])("rejects limit=%s with 400", async (limit) => {
    const res = await request(createApp()).get(
      `/api/product/list?limit=${limit}`
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("تعداد محصولات باید عددی بین ۱ تا ۴۸ باشد");
  });
});

describe("GET /api/product/list?sort=popular", () => {
  it("orders products by like count, most liked first", async () => {
    // p1 has the "largest" likes array by element value but only one like.
    await seedProducts(4, [1, 3, 0, 2]);

    const res = await request(createApp()).get(
      "/api/product/list?sort=popular"
    );

    expect(res.status).toBe(200);
    expect(
      res.body.data.products.map((p) => [p.slug, p.likesCount])
    ).toEqual([
      ["p2", 3],
      ["p4", 2],
      ["p1", 1],
      ["p3", 0],
    ]);
    expect(res.body.data.products[0]).not.toHaveProperty("likes");
  });

  it("applies limit after ordering by like count", async () => {
    await seedProducts(4, [1, 3, 0, 2]);

    const res = await request(createApp()).get(
      "/api/product/list?sort=popular&limit=2"
    );

    expect(res.status).toBe(200);
    expect(res.body.data.products.map((p) => p.slug)).toEqual(["p2", "p4"]);
    expect(res.body.data.pagination.total).toBe(4);
  });

  it("returns the same product fields as the default ordering", async () => {
    await seedProducts(2, [0, 1]);

    const [popular, plain] = await Promise.all([
      request(createApp()).get("/api/product/list?sort=popular"),
      request(createApp()).get("/api/product/list?sort=latest"),
    ]);

    expect(popular.body.data.products).toEqual(plain.body.data.products);
  });
});

describe("GET /api/product/list?sort= (invalid)", () => {
  it.each(["foo", "latest&sort=popular"])(
    "falls back to the default ordering for sort=%s",
    async (sort) => {
      await seedProducts(3);

      const res = await request(createApp()).get(
        `/api/product/list?sort=${sort}`
      );

      expect(res.status).toBe(200);
      expect(res.body.data.products.map((p) => p.slug)).toEqual([
        "p1",
        "p2",
        "p3",
      ]);
    }
  );
});

describe("GET /api/product/list?search=", () => {
  async function seedSearchable() {
    const category = await CategoryModel.create({
      title: "گوشی موبایل",
      englishTitle: "smartphones",
      description: "Phones",
    });
    const base = {
      imageLink: "uploads/test.png",
      price: 1000,
      offPrice: 1000,
      brand: "TestBrand",
      countInStock: 5,
      category: category._id,
    };
    await ProductModel.create([
      { ...base, title: "Gaming Laptop", description: "Fast", slug: "laptop" },
      { ...base, title: "Phone", description: "Has a laptop-grade chip", slug: "phone" },
      { ...base, title: "Watch (v2.0)", description: "Smart", slug: "watch" },
    ]);
  }

  const slugsFor = async (search) =>
    (await request(createApp()).get(`/api/product/list?search=${search}`))
      .body.data.products.map((p) => p.slug).sort();

  it("matches partial words in title or description, ignoring case", async () => {
    await seedSearchable();

    expect(await slugsFor("LAPT")).toEqual(["laptop", "phone"]);
  });

  it("matches regex characters literally", async () => {
    await seedSearchable();

    expect(await slugsFor(encodeURIComponent("(v2.0)"))).toEqual(["watch"]);
    expect(await slugsFor(encodeURIComponent(".*"))).toEqual([]);
  });

  it("ignores a query operator passed as search", async () => {
    await seedSearchable();

    expect(await slugsFor("[$ne]=x")).toEqual(["laptop", "phone", "watch"]);
  });
});
