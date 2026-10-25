const createError = require("http-errors");
const Joi = require("joi");
const { MongoIDPattern } = require("../../../../utils/constants");

const addProductSchema = Joi.object({
  title: Joi.string()
    .required()
    .min(3)
    .max(30)
    .error(createError.BadRequest("عنوان محصول صحیح نمیباشد")),
  description: Joi.string()
    .required()
    .error(createError.BadRequest("توضیحات ارسال شده صحیح نمیباشد")),
  slug: Joi.string()
    .required()
    .error(createError.BadRequest("اسلاگ ارسال شده صحیح نمیباشد")),
  brand: Joi.string()
    .required()
    .error(createError.BadRequest("برند محصول صحیح نمی باشد.")),
  countInStock: Joi.number()
    .required()
    .error(createError.BadRequest("موجودی محصول صحیح نمی باشد.")),
  imageLink: Joi.string()
    .required()
    .error(createError.BadRequest("لینک عکس دوره صحیح نمیباشد")),
  tags: Joi.array()
    .min(0)
    .max(20)
    .error(createError.BadRequest("برچسب ها نمیتواند بیشتر از 20 ایتم باشد")),
  category: Joi.string()
    .required()
    .regex(MongoIDPattern)
    .error(createError.BadRequest("دسته بندی مورد نظر  صحیح نمی باشد")),
  // The server computes offPrice (Q16); the controller never reads it. Still
  // allowed so the admin form validates until it stops sending it (C-16).
  offPrice: Joi.any().strip(),
  price: Joi.number()
    .required()
    .error(createError.BadRequest("قیمت وارد شده صحیح نمیباشد")),
  discount: Joi.number()
    .allow(0)
    .error(createError.BadRequest("تخفیف وارد شده صحیح نمیباشد")),
});

const changeCourseDiscountSchema = Joi.object({
  // The server computes offPrice (Q16); the controller never reads it. Still
  // allowed so the admin form validates until it stops sending it (C-16).
  offPrice: Joi.any().strip(),
  discount: Joi.number()
    .required()
    .allow(0)
    .error(createError.BadRequest("تخفیف وارد شده صحیح نمیباشد")),
});

// Only `limit` is checked; other /product/list params are read as before.
// Omitting `limit` keeps the old "return everything" behaviour (FR-API-03).
const productListQuerySchema = Joi.object({
  limit: Joi.number()
    .integer()
    .min(1)
    .max(48)
    .error(createError.BadRequest("تعداد محصولات باید عددی بین ۱ تا ۴۸ باشد")),
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .error(createError.BadRequest("شماره صفحه باید عددی صحیح و بزرگتر از صفر باشد")),
}).unknown(true);

module.exports = {
  addProductSchema,
  productListQuerySchema,
  changeCourseDiscountSchema,
};
