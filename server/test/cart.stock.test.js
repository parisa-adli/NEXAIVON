import { createRequire } from "node:module";
import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { setupTestDb } from "./helpers/db.js";
import { cookieForUser } from "./helpers/auth.js";

// Server code is CommonJS: load it with Node's require (see helpers/db.js).
const require = createRequire(import.meta.url);
const { createApp } = require("../app/app.js");
const { CategoryModel } = require("../app/models/category.js");
const { CouponModel } = require("../app/models/coupon.js");
const { PaymentModel } = require("../app/models/payment.js");
const { ProductModel } = require("../app/models/product.js");
const { UserModel } = require("../app/models/user.js");

setupTestDb();

let app;
let category;

beforeEach(async () => {
  app = createApp();
  category = await CategoryModel.create({
    title: "گوشی موبایل",
    englishTitle: "smartphones",
    description: "Smartphones",
  });
});

let productCount = 0;
async function createProduct(overrides = {}) {
  productCount += 1;
  return ProductModel.create({
    title: `Phone ${productCount}`,
    description: "A phone for tests",
    slug: `phone-${productCount}`,
    category: category._id,
    imageLink: "uploads/phone.png",
    price: 1000,
    offPrice: 1000,
    discount: 0,
    brand: "TestBrand",
    countInStock: 5,
    ...overrides,
  });
}

// lines: [[product, quantity], ...]
async function createUserWithCart(lines = [], coupon = null) {
  return UserModel.create({
    name: "Shopper",
    phoneNumber: "09120000097",
    isActive: true,
    role: "USER",
    cart: {
      products: lines.map(([product, quantity]) => ({
        productId: product._id,
        quantity,
      })),
      coupon: coupon?._id ?? null,
    },
  });
}

function addToCart(user, product) {
  return request(app)
    .post("/api/cart/add")
    .set("Cookie", cookieForUser(user))
    .send({ productId: product._id.toString() });
}

function createPayment(user) {
  return request(app)
    .post("/api/payment/create")
    .set("Cookie", cookieForUser(user));
}

function getProfile(user) {
  return request(app)
    .get("/api/user/profile")
    .set("Cookie", cookieForUser(user));
}

describe("POST /api/cart/add stock check", () => {
  it("rejects an out-of-stock product with 400", async () => {
    const product = await createProduct({ countInStock: 0 });
    const user = await createUserWithCart();

    const res = await addToCart(user, product);

    expect(res.status).toBe(400);
    const saved = await UserModel.findById(user._id);
    expect(saved.cart.products).toHaveLength(0);
  });

  it("rejects adding beyond countInStock and keeps the quantity", async () => {
    const product = await createProduct({ countInStock: 2 });
    const user = await createUserWithCart([[product, 2]]);

    const res = await addToCart(user, product);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("موجودی این محصول کافی نیست");
    const saved = await UserModel.findById(user._id);
    expect(saved.cart.products[0].quantity).toBe(2);
  });

  it("still adds up to countInStock", async () => {
    const product = await createProduct({ countInStock: 2 });
    const user = await createUserWithCart([[product, 1]]);

    const res = await addToCart(user, product);

    expect(res.status).toBe(200);
    const saved = await UserModel.findById(user._id);
    expect(saved.cart.products[0].quantity).toBe(2);
  });
});

describe("cart detail", () => {
  it("includes each line's countInStock", async () => {
    const product = await createProduct({ countInStock: 3 });
    const user = await createUserWithCart([[product, 1]]);

    const res = await getProfile(user);

    expect(res.status).toBe(200);
    expect(res.body.data.cart.productDetail[0]).toMatchObject({
      _id: product._id.toString(),
      quantity: 1,
      countInStock: 3,
    });
  });
});

describe("stale coupon in cart", () => {
  it.each([
    ["expired", { expireDate: new Date(Date.now() - 60_000) }],
    ["used up", { usageCount: 10 }],
    ["inactive", { isActive: false }],
  ])("returns the profile with totals computed without an %s coupon", async (_, staleness) => {
    const product = await createProduct({ price: 1000, offPrice: 1000 });
    const coupon = await CouponModel.create({
      code: "STALE",
      type: "fixedProduct",
      amount: 200,
      expireDate: new Date(Date.now() + 60_000),
      usageLimit: 10,
      productIds: [product._id],
      ...staleness,
    });
    const user = await createUserWithCart([[product, 2]], coupon);

    const res = await getProfile(user);

    expect(res.status).toBe(200);
    expect(res.body.data.cart.coupon).toBeNull();
    expect(res.body.data.cart.payDetail.totalPrice).toBe(2000);
    expect(res.body.data.cart.productDetail[0].offPrice).toBe(1000);
  });
});

describe("valid coupon in cart", () => {
  it("still applies to the totals", async () => {
    const product = await createProduct({ price: 1000, offPrice: 1000 });
    const coupon = await CouponModel.create({
      code: "VALID",
      type: "fixedProduct",
      amount: 200,
      expireDate: new Date(Date.now() + 60_000),
      usageLimit: 10,
      productIds: [product._id],
    });
    const user = await createUserWithCart([[product, 2]], coupon);

    const res = await getProfile(user);

    expect(res.body.data.cart.coupon.code).toBe("VALID");
    expect(res.body.data.cart.payDetail.totalPrice).toBe(1600);
  });
});

describe("POST /api/payment/create stock check", () => {
  it("rejects a line above stock with no payment, stock or cart change", async () => {
    const inStock = await createProduct({ countInStock: 5 });
    const scarce = await createProduct({ countInStock: 1 });
    const user = await createUserWithCart([
      [inStock, 1],
      [scarce, 2],
    ]);

    const res = await createPayment(user);

    expect(res.status).toBe(400);
    expect(await PaymentModel.countDocuments()).toBe(0);
    expect((await ProductModel.findById(inStock._id)).countInStock).toBe(5);
    expect((await ProductModel.findById(scarce._id)).countInStock).toBe(1);
    const saved = await UserModel.findById(user._id);
    expect(saved.cart.products).toHaveLength(2);
  });

  it("rejects a cart holding a deleted product", async () => {
    const kept = await createProduct();
    const deleted = await createProduct();
    const user = await createUserWithCart([
      [kept, 1],
      [deleted, 1],
    ]);
    await ProductModel.deleteOne({ _id: deleted._id });

    const res = await createPayment(user);

    expect(res.status).toBe(400);
    expect(await PaymentModel.countDocuments()).toBe(0);
    expect((await ProductModel.findById(kept._id)).countInStock).toBe(5);
  });

  it("creates the payment when every line is in stock", async () => {
    const product = await createProduct({ countInStock: 2 });
    const user = await createUserWithCart([[product, 2]]);

    const res = await createPayment(user);

    expect(res.status).toBe(200);
    expect(await PaymentModel.countDocuments()).toBe(1);
  });
});

describe("POST /api/payment/create stock decrement", () => {
  it("decrements each product by its ordered quantity", async () => {
    const pair = await createProduct({ countInStock: 5 });
    const single = await createProduct({ countInStock: 3 });
    const user = await createUserWithCart([
      [pair, 2],
      [single, 1],
    ]);

    const res = await createPayment(user);

    expect(res.status).toBe(200);
    expect((await ProductModel.findById(pair._id)).countInStock).toBe(3);
    expect((await ProductModel.findById(single._id)).countInStock).toBe(2);
  });

  it("lets exactly one of two concurrent orders take the last unit", async () => {
    const last = await createProduct({ countInStock: 1 });
    const first = await createUserWithCart([[last, 1]]);
    const second = await createUserWithCart([[last, 1]]);

    const results = await Promise.all([
      createPayment(first),
      createPayment(second),
    ]);

    expect(results.map((r) => r.status).sort()).toEqual([200, 400]);
    expect(await PaymentModel.countDocuments()).toBe(1);
    expect((await ProductModel.findById(last._id)).countInStock).toBe(0);
  });

  it("gives back the other lines of an order that lost the race", async () => {
    const plenty = await createProduct({ countInStock: 5 });
    const last = await createProduct({ countInStock: 1 });
    const first = await createUserWithCart([
      [plenty, 1],
      [last, 1],
    ]);
    const second = await createUserWithCart([
      [plenty, 1],
      [last, 1],
    ]);

    const results = await Promise.all([
      createPayment(first),
      createPayment(second),
    ]);

    expect(results.map((r) => r.status).sort()).toEqual([200, 400]);
    expect((await ProductModel.findById(plenty._id)).countInStock).toBe(4);
    expect((await ProductModel.findById(last._id)).countInStock).toBe(0);
  });

  it("still records a COMPLETED payment and empties the cart", async () => {
    const product = await createProduct({ countInStock: 5 });
    const user = await createUserWithCart([[product, 2]]);

    const res = await createPayment(user);

    expect(res.status).toBe(200);
    const payment = await PaymentModel.findOne({ user: user._id });
    expect(payment).toMatchObject({ status: "COMPLETED", isPaid: true });
    const saved = await UserModel.findById(user._id);
    expect(saved.cart.products).toHaveLength(0);
  });
});
