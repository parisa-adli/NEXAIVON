const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const createError = require("http-errors");
const { allRoutes } = require("./router/router");
const { UPLOADS_DIR, UPLOADS_URL_PATH } = require("../utils/constants");

// Builds the Express app only: no listen(), no DB connection, no dotenv.
// Startup lives in index.js so tests can build the app on their own.
function createApp({ uploadsDir = UPLOADS_DIR } = {}) {
  const app = express();
  // Admin uploads are written here (FR-API-17), and served from here below.
  app.locals.uploadsDir = uploadsDir;

  app.use(cors({ credentials: true, origin: process.env.ALLOW_CORS_ORIGIN }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  // Only the uploads folder is static: serving anything wider exposes
  // server source (NFR-15).
  // nosniff stops browsers from reading an upload as HTML or script.
  app.use(
    UPLOADS_URL_PATH,
    express.static(uploadsDir, {
      setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
    })
  );
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
