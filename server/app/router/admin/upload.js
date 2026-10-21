const router = require("express").Router();
const expressAsyncHandler = require("express-async-handler");
const createHttpError = require("http-errors");
const multer = require("multer");
const { MAX_IMAGE_MB } = require("../../../utils/constants");
const { toPersianDigits } = require("../../../utils/functions");
const {
  UploadController,
} = require("../../http/controllers/admin/upload/upload.controller");

// Held in memory so the controller can check the file's bytes before
// anything touches the disk. The size limit bounds that memory.
const parseImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024, files: 1, fields: 5 },
}).single("image");

// Turns multer's errors into the app's Persian http-errors.
function receiveImage(req, res, next) {
  parseImage(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE")
        return next(
          createHttpError.PayloadTooLarge(
            `حجم تصویر نباید بیشتر از ${toPersianDigits(MAX_IMAGE_MB)} مگابایت باشد.`
          )
        );
      return next(createHttpError.BadRequest("فایل ارسالی معتبر نیست."));
    }
    if (error) return next(error);
    if (!req.file)
      return next(createHttpError.BadRequest("لطفا یک تصویر انتخاب کنید."));
    next();
  });
}

router.post(
  "/image",
  receiveImage,
  expressAsyncHandler(UploadController.uploadImage)
);

module.exports = {
  uploadAdminRoutes: router,
};
