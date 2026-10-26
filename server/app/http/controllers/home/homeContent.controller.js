const Controller = require("../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { HomeContentModel } = require("../../../models/homeContent");
const {
  homeContentSchema,
} = require("../../validators/admin/homeContent.schema");

const HOME_KEY = "home";

class HomeContentController extends Controller {
  async getHomeContent(req, res) {
    const home = await HomeContentModel.findOne({ key: HOME_KEY });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        content: home?.content || {},
      },
    });
  }
  async updateHomeContent(req, res) {
    const content = await homeContentSchema.validateAsync(req.body);
    const home = await HomeContentModel.findOneAndUpdate(
      { key: HOME_KEY },
      { $set: { content } },
      { new: true, upsert: true }
    );
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "محتوای صفحه اصلی با موفقیت به روز رسانی شد",
        content: home.content,
      },
    });
  }
}

module.exports = {
  HomeContentController: new HomeContentController(),
};
