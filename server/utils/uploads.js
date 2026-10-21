const { UPLOADS_URL_PATH } = require("./constants");

// Public URL of a file under the uploads folder, e.g. uploadUrl("seed",
// "phone.png"). Absolute, so next/image can load it from the API host.
function uploadUrl(...segments) {
  return [`${process.env.SERVER_URL}${UPLOADS_URL_PATH}`, ...segments].join("/");
}

module.exports = { uploadUrl };
