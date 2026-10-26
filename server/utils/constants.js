const path = require("path");

module.exports = {
  // The public uploads folder (admin uploads, seed images) and the URL path
  // it is served at. It is the only folder served statically (NFR-15).
  UPLOADS_DIR: path.join(__dirname, "..", "uploads"),
  UPLOADS_URL_PATH: "/uploads",
  // Admin image uploads are capped at this size (FR-API-17).
  MAX_IMAGE_MB: 2,
  // Any 24-digit hex ObjectId, all-digit ones included (seed ids are).
  MongoIDPattern: /^[a-f\d]{24}$/i,
  // Public demo login; the client pre-fills these (client/src/constants/demo.js).
  DEMO_CREDENTIALS: Object.freeze({ username: "demo", password: "demo1234" }),
  ROLES: Object.freeze({
    USER: "USER",
    ADMIN: "ADMIN",
    WRITER: "WRITER",
    TEACHER: "TEACHER",
  }),
};
