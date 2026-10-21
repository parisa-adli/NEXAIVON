import { createRequire } from "node:module";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { loggedCode } from "./helpers/otp.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { assertSeedAllowed, seed } = require("../scripts/seed.js");

setupTestDb();

const ADMIN_PHONE = "09120000001";
const USER_PHONE = "09120000002";
const SERVER_URL = "http://localhost:5000";

// Seeds into a fresh temporary uploads folder and returns the app.
async function seededApp() {
  const uploadsDir = mkdtempSync(join(tmpdir(), "seed-uploads-"));
  await seed({ uploadsDir });
  return { app: createApp(), uploadsDir };
}

// Signs in through the real OTP flow (the code is read from the dev/test log)
// and returns a Cookie header for the session. The cookies are Secure with
// Domain=localhost, so a supertest agent would not send them back itself.
async function signIn(app, phoneNumber) {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  await request(app).post("/api/user/get-otp").send({ phoneNumber });
  const otp = loggedCode(logSpy, phoneNumber);
  logSpy.mockRestore();
  const res = await request(app)
    .post("/api/user/check-otp")
    .send({ phoneNumber, otp });
  expect(res.status).toBe(200);
  return res.headers["set-cookie"].map((c) => c.split(";")[0]).join("; ");
}

async function productBySlug(app, slug) {
  const res = await request(app).get("/api/product/list");
  return res.body.data.products.find((p) => p.slug === slug);
}

async function addToCart(app, cookie, slug) {
  const product = await productBySlug(app, slug);
  const res = await request(app)
    .post("/api/cart/add")
    .set("Cookie", cookie)
    .send({ productId: product._id });
  expect(res.status).toBe(200);
}

const applyCoupon = (app, cookie, couponCode) =>
  request(app).post("/api/cart/coupon").set("Cookie", cookie).send({ couponCode });

describe("seed guard", () => {
  it("refuses to run against production", () => {
    for (const NODE_ENV of ["production", " Production ", "PRODUCTION"])
      expect(() => assertSeedAllowed({ NODE_ENV, SERVER_URL })).toThrow(/production/);
  });

  it("refuses to run when NODE_ENV is not set", () => {
    expect(() => assertSeedAllowed({})).toThrow(/NODE_ENV/);
  });

  it("allows development and test", () => {
    expect(() => assertSeedAllowed({ NODE_ENV: "development", SERVER_URL })).not.toThrow();
    expect(() => assertSeedAllowed({ NODE_ENV: "test", SERVER_URL })).not.toThrow();
  });
});

describe("seed data", () => {
  let app;
  let uploadsDir;
  let products;

  beforeEach(async () => {
    ({ app, uploadsDir } = await seededApp());
    products = (await request(app).get("/api/product/list")).body.data.products;
  });

  it("creates the four Q19 product categories and one non-product category", async () => {
    const productCategories = await request(app).get("/api/category/list?type=product");
    const allCategories = await request(app).get("/api/category/list");

    expect(
      productCategories.body.data.categories.map((c) => c.englishTitle).sort()
    ).toEqual(["accessories", "headphones", "smartphones", "smartwatches"]);
    const nonProduct = allCategories.body.data.categories.filter(
      (c) => c.type !== "product"
    );
    expect(nonProduct).toHaveLength(1);
  });

  it("has products for every stock and pricing rule", () => {
    const stocks = products.map((p) => p.countInStock);

    expect(new Set(products.map((p) => p.category.englishTitle))).toEqual(
      new Set(["smartphones", "headphones", "smartwatches", "accessories"])
    );
    expect(stocks).toContain(0);
    expect(stocks.some((s) => s >= 1 && s <= 3)).toBe(true);
    expect(stocks.some((s) => s >= 20)).toBe(true);

    const notDiscounted = products.filter((p) => !p.discount);
    expect(notDiscounted.length).toBeGreaterThan(0);
    for (const p of notDiscounted) expect(p.offPrice).toBe(p.price);
    // Worked example: 18,500,000 at 10% off.
    expect(products.find((p) => p.slug === "galaxy-a55")).toMatchObject({
      price: 18500000,
      discount: 10,
      offPrice: 16650000,
    });
  });

  it("has a long Persian description with line breaks and a Latin model name", () => {
    expect(
      products.some(
        (p) =>
          p.description.length > 300 &&
          p.description.includes("\n") &&
          /[؀-ۿ]/.test(p.description)
      )
    ).toBe(true);
    expect(products.some((p) => /^[A-Za-z0-9 .-]+$/.test(p.title))).toBe(true);
  });

  it("links every product image to a PNG copied into the uploads folder", () => {
    const prefix = `${process.env.SERVER_URL}/uploads/`;

    for (const { imageLink } of products) {
      expect(imageLink.startsWith(prefix)).toBe(true);
      const file = readFileSync(join(uploadsDir, imageLink.slice(prefix.length)));
      // PNG signature.
      expect(file.subarray(0, 4)).toEqual(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    }
  });
});

describe("seed users", () => {
  let app;

  beforeEach(async () => {
    ({ app } = await seededApp());
  });

  it("has an admin who can sign in and reach the admin API", async () => {
    const adminCookie = await signIn(app, ADMIN_PHONE);

    const profile = await request(app).get("/api/user/profile").set("Cookie", adminCookie);
    expect(profile.body.data.user).toMatchObject({ role: "ADMIN", isActive: true });
    const users = await request(app).get("/api/admin/user/list").set("Cookie", adminCookie);
    expect(users.status).toBe(200);
  });

  it("has a normal user with a complete profile and no admin access", async () => {
    const userCookie = await signIn(app, USER_PHONE);

    const profile = await request(app).get("/api/user/profile").set("Cookie", userCookie);
    expect(profile.body.data.user).toMatchObject({ role: "USER", isActive: true });
    expect(profile.body.data.user.name).toBeTruthy();
    const users = await request(app).get("/api/admin/user/list").set("Cookie", userCookie);
    expect(users.status).toBe(403);
  });
});

describe("seed coupons", () => {
  let app;
  let userCookie;

  beforeEach(async () => {
    ({ app } = await seededApp());
    userCookie = await signIn(app, USER_PHONE);
    await addToCart(app, userCookie, "iphone-15");
  });

  it("has a valid percent coupon", async () => {
    const res = await applyCoupon(app, userCookie, "PERCENT10");

    expect(res.status).toBe(200);
    // 62,000,000 at 10% off.
    expect(res.body.data.cart.payDetail.totalPrice).toBe(55800000);
  });

  it("has a valid fixedProduct coupon", async () => {
    await addToCart(app, userCookie, "xiaomi-powerbank-20000");

    const res = await applyCoupon(app, userCookie, "FIXED500");

    expect(res.status).toBe(200);
    // iPhone is not covered: 62,000,000 + (2,100,000 − 500,000).
    expect(res.body.data.cart.payDetail.totalPrice).toBe(63600000);
  });

  it.each([
    ["EXPIRED15", "کد تخفیف منقضی شده است"],
    ["USEDUP20", "ظرفیت کد تخفیف به اتمام رسیده است"],
    ["INACTIVE25", "کد تخفیف فعال نیست"],
    // Valid, but only for smartwatches.
    ["WATCHES10", "کد تخفیف مختص هیچ کدام از این محصولات نمی باشد."],
  ])("has coupon %s that is rejected", async (code, message) => {
    const res = await applyCoupon(app, userCookie, code);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(message);
  });
});

describe("re-running the seed", () => {
  it("resets an in-use database to identical data", async () => {
    const { app, uploadsDir } = await seededApp();
    const snapshot = async () => {
      const adminCookie = await signIn(app, ADMIN_PHONE);
      const get = (url) => request(app).get(url).set("Cookie", adminCookie);
      const users = (await get("/api/admin/user/list")).body.data.users;
      return {
        products: (await get("/api/product/list")).body.data.products,
        categories: (await get("/api/category/list")).body.data.categories,
        coupons: (await get("/api/admin/coupon/list")).body.data.coupons,
        payments: (await get("/api/admin/payment/list")).body.data.payments,
        phones: users.map((u) => u.phoneNumber).sort(),
      };
    };
    const first = await snapshot();

    // Use the shop: a new sign-up, and an order with a coupon, which changes
    // stock, coupon usage and payments.
    await signIn(app, "09129999999");
    const userCookie = await signIn(app, USER_PHONE);
    await addToCart(app, userCookie, "iphone-15");
    await applyCoupon(app, userCookie, "PERCENT10");
    const order = await request(app).post("/api/payment/create").set("Cookie", userCookie);
    expect(order.status).toBe(200);

    await seed({ uploadsDir });
    const second = await snapshot();

    expect(second).toEqual(first);
    expect(first.payments).toEqual([]);
    expect(first.phones).toEqual([ADMIN_PHONE, USER_PHONE]);
  });
});
