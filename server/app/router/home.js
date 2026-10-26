const router = require("express").Router();
const expressAsyncHandler = require("express-async-handler");
const {
  HomeContentController,
} = require("../http/controllers/home/homeContent.controller");

router.get("/", expressAsyncHandler(HomeContentController.getHomeContent));

module.exports = {
  homeRoutes: router,
};
