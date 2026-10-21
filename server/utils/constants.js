const path = require("path");

module.exports = {
  // The public uploads folder (admin uploads, seed images) and the URL path
  // it is served at. It is the only folder served statically (NFR-15).
  UPLOADS_DIR: path.join(__dirname, "..", "uploads"),
  UPLOADS_URL_PATH: "/uploads",
  // Admin image uploads are capped at this size (FR-API-17).
  MAX_IMAGE_MB: 2,
  MongoIDPattern: /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i,
  ROLES: Object.freeze({
    USER: "USER",
    ADMIN: "ADMIN",
    WRITER: "WRITER",
    TEACHER: "TEACHER",
  }),
};
