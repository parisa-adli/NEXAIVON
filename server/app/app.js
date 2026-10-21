const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const path = require("path");
const { allRoutes } = require("./router/router");

// Builds the Express app only: no listen(), no DB connection, no dotenv.
// Startup lives in index.js so tests can build the app on their own.
function createApp() {
  const app = express();

  app.use(cors({ credentials: true, origin: process.env.ALLOW_CORS_ORIGIN }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, "..")));
  app.use(cookieParser(process.env.COOKIE_PARSER_SECRET_KEY));

  app.use("/api", allRoutes);

  app.use((req, res, next) => {
    next(createError.NotFound("آدرس مورد نظر یافت نشد"));
  });
  app.use((error, req, res, next) => {
    const serverError = createError.InternalServerError();
    const statusCode = error.status || serverError.status;
    const message = error.message || serverError.message;
    return res.status(statusCode).json({
      statusCode,
      message,
    });
  });

  return app;
}

module.exports = { createApp };
