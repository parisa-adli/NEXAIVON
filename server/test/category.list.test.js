import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { CategoryModel } = require("../app/models/category.js");

setupTestDb();

async function seedCategories() {
  const phones = await CategoryModel.create({
    title: "گوشی موبایل",
    englishTitle: "smartphones",
    description: "Phones",
    type: "product",
  });
  await CategoryModel.create([
    {
      title: "گوشی اندروید",
      englishTitle: "android-phones",
      description: "Android phones",
      type: "product",
      parentId: phones._id,
    },
    { title: "اخبار", englishTitle: "news", description: "News", type: "post" },
  ]);
  return { phones };
}

function sortedEnglishTitles(res) {
  return res.body.data.categories.map((c) => c.englishTitle).sort();
}

describe("GET /api/category/list", () => {
  it("returns every category when called without params", async () => {
    await seedCategories();

    const res = await request(createApp()).get("/api/category/list");

    expect(res.status).toBe(200);
    expect(sortedEnglishTitles(res)).toEqual(["android-phones", "news", "smartphones"]);
  });

  it("rejects a query operator passed as type with 400", async () => {
    await seedCategories();

    const res = await request(createApp()).get(
      "/api/category/list?type[$ne]=product"
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("نوع دسته بندی صحیح نمی باشد");
  });

  it("rejects an unknown type with 400", async () => {
    await seedCategories();

    const res = await request(createApp()).get("/api/category/list?type=foo");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("نوع دسته بندی صحیح نمی باشد");
  });

  it("filters by type, as the storefront calls it", async () => {
    await seedCategories();

    const res = await request(createApp()).get("/api/category/list?type=product");

    expect(res.status).toBe(200);
    expect(sortedEnglishTitles(res)).toEqual(["android-phones", "smartphones"]);
  });

  it("ignores unknown query keys", async () => {
    await seedCategories();

    const res = await request(createApp()).get(
      "/api/category/list?englishTitle=news&title[$regex]=."
    );

    expect(res.status).toBe(200);
    expect(sortedEnglishTitles(res)).toEqual(["android-phones", "news", "smartphones"]);
  });

  it("filters by parentId", async () => {
    const { phones } = await seedCategories();

    const res = await request(createApp()).get(
      `/api/category/list?parentId=${phones._id}`
    );

    expect(res.status).toBe(200);
    expect(sortedEnglishTitles(res)).toEqual(["android-phones"]);
  });

  it("rejects a malformed parentId with 400", async () => {
    await seedCategories();

    const res = await request(createApp()).get(
      "/api/category/list?parentId=not-an-id"
    );

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("شناسه ارسال شده صحیح نمیباشد");
  });
});
