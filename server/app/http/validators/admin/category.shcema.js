const Joi = require("joi");
const createHttpError = require("http-errors");
const { MongoIDPattern } = require("../../../../utils/constants");

const addCategorySchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(100)
    .error(createHttpError.BadRequest("عنوان فارسی دسته بندی صحیح نمیباشد")),
  englishTitle: Joi.string()
    .required()
    .min(3)
    .max(100)
    .error(
      createHttpError.BadRequest("عنوان انگلیسی دسته بندی صیحیح نمی باشد")
    ),
  description: Joi.string()
    .required()
    .min(3)
    .max(200)
    .error(createHttpError.BadRequest("توضیحات دسته بندی صحیح نمی باشد")),
  type: Joi.string()
    .required()
    .min(3)
    .max(100)
    .valid("product", "post", "comment", "ticket")
    .error(createHttpError.BadRequest("نوع دسته بندی صحیح نمی باشد")),
  parent: Joi.string()
    .allow("")
    .pattern(MongoIDPattern)
    .error(createHttpError.BadRequest("شناسه ارسال شده صحیح نمیباشد")),
});

const updateCategorySchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(100)
    .error(createHttpError.BadRequest("عنوان فارسی دسته بندی صحیح نمیباشد")),
  englishTitle: Joi.string()
    .min(3)
    .max(100)
    .error(
      createHttpError.BadRequest("عنوان انگلیسی دسته بندی صیحیح نمی باشد")
    ),
  description: Joi.string()
    .required()
    .min(3)
    .max(200)
    .error(createHttpError.BadRequest("توضیحات دسته بندی صحیح نمی باشد")),
  type: Joi.string()
    .required()
    .min(3)
    .max(100)
    .valid("product", "post", "comment", "ticket")
    .error(createHttpError.BadRequest("نوع دسته بندی صحیح نمی باشد")),
});

// Query for the public GET /category/list. Only these keys reach the DB;
// validate with { stripUnknown: true } so any other key is dropped.
const categoryListQuerySchema = Joi.object({
  type: Joi.string()
    .valid("product", "post", "comment", "ticket")
    .error(createHttpError.BadRequest("نوع دسته بندی صحیح نمی باشد")),
  parentId: Joi.string()
    .pattern(MongoIDPattern)
    .error(createHttpError.BadRequest("شناسه ارسال شده صحیح نمیباشد")),
});

module.exports = {
  addCategorySchema,
  updateCategorySchema,
  categoryListQuerySchema,
};
