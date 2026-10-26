const Joi = require("joi");
const createHttpError = require("http-errors");
const { UPLOADS_URL_PATH } = require("../../../../utils/constants");

const MAX_ITEMS = 20;

const text = (max) => Joi.string().trim().max(max).allow("");
const requiredText = (max) => Joi.string().trim().min(1).max(max).required();
const list = (item) => Joi.array().items(item).max(MAX_ITEMS).required();

// Site paths, in-page anchors or http(s) links: never javascript: or data:.
const href = Joi.string()
  .trim()
  .max(300)
  .pattern(/^(\/(?!\/)|#|https?:\/\/)/)
  .required();

// A file in the client's public folder or an upload on this server, the only
// hosts next/image is allowed to load.
const image = Joi.string()
  .trim()
  .max(300)
  .custom((value, helpers) => {
    const isLocal = value.startsWith("/") && !value.startsWith("//");
    const isUpload = value.startsWith(
      `${process.env.SERVER_URL}${UPLOADS_URL_PATH}/`
    );
    return isLocal || isUpload ? value : helpers.error("any.invalid");
  });

// A react-icons component name; the client maps it and ignores unknown names.
const icon = Joi.string().pattern(/^[A-Za-z0-9]{1,40}$/).allow("");

const homeContentSchema = Joi.object({
  navLinks: list(Joi.object({ label: requiredText(40), href })),
  searchTags: list(requiredText(40)),
  heroSlides: list(
    Joi.object({
      eyebrow: text(80),
      title: requiredText(80),
      subtitle: text(160),
      image: image.allow(""),
      icon,
    })
  ).min(1),
  homeCategories: list(
    Joi.object({
      label: requiredText(40),
      category: Joi.string()
        .pattern(/^[a-z0-9-]{1,40}$/)
        .required(),
      image: image.required(),
    })
  ),
  promos: list(
    Joi.object({
      chip: text(40),
      title: requiredText(80),
      subtitle: text(160),
      image: image.allow("").required(),
      dark: Joi.boolean().required(),
    })
  ),
  brands: list(
    Joi.object({ name: requiredText(40), icon, wide: Joi.boolean().required() })
  ),
  services: list(
    Joi.object({ title: requiredText(40), subtitle: text(80), icon })
  ),
  footerLinks: list(Joi.object({ label: requiredText(40), href })),
  contact: Joi.object({
    phone: text(40),
    email: Joi.string().trim().email().allow("").required(),
    address: text(200),
  }).required(),
})
  .required()
  // The path tells the admin which field to fix, e.g. "heroSlides.0.title".
  .error((errors) =>
    createHttpError.BadRequest(
      `اطلاعات صفحه اصلی صحیح نمی باشد (${errors[0].path.join(".")})`
    )
  );

module.exports = {
  homeContentSchema,
};
