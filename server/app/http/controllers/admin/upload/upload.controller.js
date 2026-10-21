const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const Controller = require("../../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const createHttpError = require("http-errors");
const { uploadUrl } = require("../../../../../utils/uploads");

// Uploaded images live in this subfolder of the uploads folder.
const IMAGES_SUBDIR = "images";

// Allowed image types, recognised by their leading bytes. The client's file
// name and mimetype are never trusted: SVG or HTML served from our origin
// could run script.
const IMAGE_SIGNATURES = [
  { extension: "png", matches: (b) => hasBytes(b, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) },
  { extension: "jpg", matches: (b) => hasBytes(b, 0, [0xff, 0xd8, 0xff]) },
  {
    extension: "webp",
    matches: (b) => hasBytes(b, 0, Buffer.from("RIFF")) && hasBytes(b, 8, Buffer.from("WEBP")),
  },
];

function hasBytes(buffer, offset, bytes) {
  return buffer.subarray(offset, offset + bytes.length).equals(Buffer.from(bytes));
}

function detectImageExtension(buffer) {
  return IMAGE_SIGNATURES.find(({ matches }) => matches(buffer))?.extension;
}

class UploadController extends Controller {
  async uploadImage(req, res) {
    const extension = detectImageExtension(req.file.buffer);
    if (!extension)
      throw createHttpError.BadRequest(
        "فرمت تصویر مجاز نیست. فقط PNG، JPEG و WebP پذیرفته می‌شود."
      );

    // The name is generated here, never taken from the client, so an upload
    // can neither escape the images folder nor overwrite another file.
    const fileName = `${crypto.randomUUID()}.${extension}`;
    const imagesDir = path.join(req.app.locals.uploadsDir, IMAGES_SUBDIR);
    await fs.mkdir(imagesDir, { recursive: true });
    await fs.writeFile(path.join(imagesDir, fileName), req.file.buffer);

    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        url: uploadUrl(IMAGES_SUBDIR, fileName),
      },
    });
  }
}

module.exports = {
  UploadController: new UploadController(),
};
