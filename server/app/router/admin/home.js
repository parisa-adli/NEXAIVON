const router = require("express").Router();
const expressAsyncHandler = require("express-async-handler");
const {
  HomeContentController,
} = require("../../http/controllers/home/homeContent.controller");

router.put("/", expressAsyncHandler(HomeContentController.updateHomeContent));

module.exports = {
  homeAdminRoutes: router,
};
