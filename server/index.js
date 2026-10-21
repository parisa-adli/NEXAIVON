require("dotenv").config();
const mongoose = require("mongoose");
const { createApp } = require("./app/app.js");
const { validateEnv } = require("./utils/env.js");

const PORT = process.env.PORT || 5000;

async function main() {
  try {
    validateEnv(process.env);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.APP_DB);
    console.log("MongoDB connected!!");
  } catch (err) {
    console.log("Failed to connect to MongoDB", err);
    process.exit(1);
  }

  createApp().listen(PORT, () => console.log(`listening on port ${PORT}`));
}

main();
