// One-off migration (Q16): recompute offPrice for every existing product from
// its price and discount, replacing admin-entered values. Safe to re-run.
//
// Usage: node scripts/migrate-offprice.js   (reads APP_DB from server/.env)
const path = require("path");
const mongoose = require("mongoose");
const { ProductModel } = require("../app/models/product");
const { computeOffPrice } = require("../utils/functions");

// Returns how many products had their offPrice changed.
async function recomputeOffPrices() {
  const products = await ProductModel.find(
    {},
    { price: 1, discount: 1, offPrice: 1 }
  ).lean();
  const updates = products
    .map((product) => ({
      _id: product._id,
      offPrice: computeOffPrice(product.price, product.discount ?? 0),
      current: product.offPrice,
    }))
    .filter(({ offPrice, current }) => offPrice !== current)
    .map(({ _id, offPrice }) => ({
      updateOne: { filter: { _id }, update: { $set: { offPrice } } },
    }));
  if (updates.length === 0) return 0;
  const result = await ProductModel.bulkWrite(updates);
  return result.modifiedCount;
}

async function main() {
  require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
  if (!process.env.APP_DB) {
    console.log("APP_DB is not set");
    process.exit(1);
  }
  await mongoose.connect(process.env.APP_DB);
  try {
    const updated = await recomputeOffPrices();
    console.log(`offPrice recomputed for ${updated} product(s)`);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.log("offPrice migration failed", err);
    process.exit(1);
  });
}

module.exports = { recomputeOffPrices };
