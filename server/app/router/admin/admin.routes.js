const { ROLES } = require("../../../utils/constants");
const {
  authorize,
  requireMainAdmin,
} = require("../../http/middlewares/permission.guard");
const { categoryAdminRoutes } = require("./category");
const { couponAdminRoutes } = require("./coupon");
const { homeAdminRoutes } = require("./home");
const { paymentAdminRoutes } = require("./payment");
const { productsAdminRoutes } = require("./product");
const { uploadAdminRoutes } = require("./upload");
const { userAdminRoutes } = require("./user");

const router = require("express").Router();

router.use("/category", authorize(ROLES.ADMIN), categoryAdminRoutes);
router.use("/product", authorize(ROLES.ADMIN), productsAdminRoutes);
router.use("/coupon", authorize(ROLES.ADMIN), couponAdminRoutes);
router.use("/user", authorize(ROLES.ADMIN), userAdminRoutes);
router.use("/payment", authorize(ROLES.ADMIN), paymentAdminRoutes);
router.use("/upload", authorize(ROLES.ADMIN), uploadAdminRoutes);
router.use("/home", authorize(ROLES.ADMIN), requireMainAdmin, homeAdminRoutes);

module.exports = {
  adminRoutes: router,
};
