// Development seed (sub-PRD 11 §2): resets the database to deterministic
// electronics sample data. Never runs against production.
//
// Usage: npm run seed   (reads APP_DB, NODE_ENV and SERVER_URL from server/.env)
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { validateEnv } = require("../utils/env");
const { CategoryModel } = require("../app/models/category");
const { ProductModel } = require("../app/models/product");
const { CouponModel } = require("../app/models/coupon");
const { UserModel } = require("../app/models/user");
const { PaymentModel } = require("../app/models/payment");
const { computeOffPrice } = require("../utils/functions");
const { UPLOADS_DIR } = require("../utils/constants");
const { uploadUrl } = require("../utils/uploads");
const fixtures = require("./seed/fixtures");

// Throws unless the environment is clearly not production. The seed wipes
// collections, so an unset NODE_ENV is refused too.
function assertSeedAllowed(env) {
  validateEnv(env);
  if (env.NODE_ENV.trim().toLowerCase() === "production")
    throw new Error("Refusing to seed: NODE_ENV is production");
}

// Seed images are copied to <uploadsDir>/seed and served from the API host
// at /uploads/seed (FR-API-17).
const IMAGES_SOURCE = path.join(__dirname, "seed", "images");
const IMAGES_SUBDIR = "seed";

// Empties the seeded collections and inserts the fixtures. Only the seed
// subfolder of the uploads folder is replaced; admin uploads are kept.
async function seed({ uploadsDir = UPLOADS_DIR } = {}) {
  assertSeedAllowed(process.env);
  const imagesDir = path.join(uploadsDir, IMAGES_SUBDIR);
  fs.rmSync(imagesDir, { recursive: true, force: true });
  fs.cpSync(IMAGES_SOURCE, imagesDir, { recursive: true });

  const products = fixtures.products.map(({ image, ...product }) => ({
    ...product,
    imageLink: uploadUrl(IMAGES_SUBDIR, image),
    offPrice: computeOffPrice(product.price, product.discount),
  }));

  const models = [CategoryModel, ProductModel, CouponModel, UserModel, PaymentModel];
  await Promise.all(models.map((model) => model.deleteMany({})));
  await CategoryModel.insertMany(fixtures.categories);
  await ProductModel.insertMany(products);
  await CouponModel.insertMany(fixtures.coupons);
  await UserModel.insertMany(fixtures.users);
}

async function main() {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  // Checked again in seed(); here it fails before connecting.
  assertSeedAllowed(process.env);
  if (!process.env.APP_DB) {
    console.log("APP_DB is not set");
    process.exit(1);
  }
  await mongoose.connect(process.env.APP_DB);
  try {
    await seed();
    const { categories, products, coupons, users } = fixtures;
    console.log(
      `Seeded ${categories.length} categories, ${products.length} products, ` +
        `${coupons.length} coupons and ${users.length} users`
    );
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.log("Seed failed", err);
    process.exit(1);
  });
}

module.exports = { assertSeedAllowed, seed };
