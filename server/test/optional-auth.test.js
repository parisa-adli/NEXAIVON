import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { accessTokenCookie, cookieForUser } from "./helpers/auth.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const JWT = require("jsonwebtoken");
const { createApp } = require("../app/app.js");
const { CategoryModel } = require("../app/models/category.js");
const { ProductModel } = require("../app/models/product.js");
const { UserModel } = require("../app/models/user.js");

setupTestDb();

async function createUser() {
  return UserModel.create({
    name: "Returning user",
    phoneNumber: "09120000098",
    isActive: true,
    role: "USER",
  });
}

async function createProductLikedBy(user) {
  const category = await CategoryModel.create({
    title: "گوشی موبایل",
    englishTitle: "smartphones",
    description: "Phones",
  });
  return ProductModel.create({
    title: "Liked phone",
    description: "A phone the user liked",
    slug: "liked-phone",
    category: category._id,
    imageLink: "uploads/liked-phone.png",
    price: 1000,
    offPrice: 1000,
    discount: 0,
    brand: "TestBrand",
    countInStock: 5,
    likes: [user._id],
  });
}

function expiredCookie(user) {
  const expiredAt = Math.floor(Date.now() / 1000) - 60;
  return accessTokenCookie(
    JWT.sign(
      { _id: user._id, exp: expiredAt },
      process.env.ACCESS_TOKEN_SECRET_KEY
    )
  );
}

describe("optional auth on GET /api/product/list", () => {
  it("treats an expired access token as a guest", async () => {
    const user = await createUser();
    await createProductLikedBy(user);

    const res = await request(createApp())
      .get("/api/product/list")
      .set("Cookie", expiredCookie(user));

    expect(res.status).toBe(200);
    expect(res.body.data.products).toHaveLength(1);
    expect(res.body.data.products[0].isLiked).toBe(false);
  });

  it("treats a token signed with the wrong key as a guest", async () => {
    const user = await createUser();
    await createProductLikedBy(user);
    const forged = JWT.sign({ _id: user._id }, "not-the-secret", {
      expiresIn: "1h",
    });

    const res = await request(createApp())
      .get("/api/product/list")
      .set("Cookie", accessTokenCookie(forged));

    expect(res.status).toBe(200);
    expect(res.body.data.products[0].isLiked).toBe(false);
  });

  it("treats a token for a deleted user as a guest", async () => {
    const user = await createUser();
    await createProductLikedBy(user);
    const cookie = cookieForUser(user);
    await UserModel.deleteOne({ _id: user._id });

    const res = await request(createApp())
      .get("/api/product/list")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.products[0].isLiked).toBe(false);
  });

  it("still recognises a valid token", async () => {
    const user = await createUser();
    await createProductLikedBy(user);
    const cookie = cookieForUser(user);

    const res = await request(createApp())
      .get("/api/product/list")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.products[0].isLiked).toBe(true);
  });
});

describe("optional auth on GET /api/product/slug/:slug", () => {
  it("treats an expired access token as a guest", async () => {
    const user = await createUser();
    await createProductLikedBy(user);

    const res = await request(createApp())
      .get("/api/product/slug/liked-phone")
      .set("Cookie", expiredCookie(user));

    expect(res.status).toBe(200);
  });
});

describe("required auth on POST /api/product/like/:id", () => {
  it("still rejects an expired access token with 401", async () => {
    const user = await createUser();
    const product = await createProductLikedBy(user);

    const res = await request(createApp())
      .post(`/api/product/like/${product._id}`)
      .set("Cookie", expiredCookie(user));

    expect(res.status).toBe(401);
  });
});
