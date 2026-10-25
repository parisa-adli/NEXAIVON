const Joi = require("joi");
const createHttpError = require("http-errors");
const { ROLES } = require("../../../../utils/constants");

// Admin can change only these fields; at least one must be sent.
const updateUserByAdminSchema = Joi.object({
  role: Joi.string()
    .valid(ROLES.USER, ROLES.ADMIN)
    .error(createHttpError.BadRequest("نقش کاربر صحیح نمی باشد")),
  isBlocked: Joi.boolean()
    .strict()
    .error(createHttpError.BadRequest("وضعیت کاربر صحیح نمی باشد")),
})
  .or("role", "isBlocked")
  .error(createHttpError.BadRequest("اطلاعات ارسال شده صحیح نمی باشد"));

module.exports = {
  updateUserByAdminSchema,
};
