import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { setupTestDb } from "./helpers/db.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { CategoryModel } = require("../app/models/category.js");
const { ProductModel } = require("../app/models/product.js");
const { recomputeOffPrices } = require("../scripts/migrate-offprice.js");

setupTestDb();

describe("one-off offPrice migration", () => {
  it("recomputes offPrice for every existing product", async () => {
    const category = await CategoryModel.create({
      title: "گوشی موبایل",
      englishTitle: "smartphones",
      description: "Smartphones",
    });
    const base = {
      description: "Legacy product",
      category: category._id,
      imageLink: "uploads/legacy.png",
      brand: "TestBrand",
      countInStock: 1,
    };
    // Admin-entered offPrice values that break the pricing invariant.
    await ProductModel.create([
      { ...base, title: "Discounted", slug: "discounted", price: 1000000, discount: 15, offPrice: 900000 },
      { ...base, title: "Not discounted", slug: "not-discounted", price: 500000, discount: 0, offPrice: 0 },
    ]);
    // A legacy document with no discount field at all.
    await ProductModel.collection.insertOne({
      ...base,
      title: "No discount field",
      slug: "no-discount-field",
      price: 300000,
      offPrice: 1,
    });

    const updated = await recomputeOffPrices();

    expect(updated).toBe(3);
    const offPrices = Object.fromEntries(
      (await ProductModel.find({}, { slug: 1, offPrice: 1 }).lean()).map(
        (product) => [product.slug, product.offPrice]
      )
    );
    expect(offPrices).toEqual({
      discounted: 850000,
      "not-discounted": 500000,
      "no-discount-field": 300000,
    });
  });
});
