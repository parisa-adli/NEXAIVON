import { createRequire } from "node:module";
import { afterAll, afterEach, beforeAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";

// Load server code (and mongoose) with Node's require, the same way the app
// does. Importing a model through Vitest as well would evaluate it twice and
// throw OverwriteModelError.
const require = createRequire(import.meta.url);
const mongoose = require("mongoose");

// Gives the calling test file its own in-memory mongod, and empties every
// collection after each test.
export function setupTestDb() {
  let mongod;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterEach(async () => {
    const collections = Object.values(mongoose.connection.collections);
    await Promise.all(collections.map((collection) => collection.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongod?.stop();
  });
}
