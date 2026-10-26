const { getUserCartDetail } = require("../../../../../utils/functions");
const { PaymentModel } = require("../../../../models/payment");
const { UserModel } = require("../../../../models/user");
const Controller = require("../../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const createError = require("http-errors");
const { MongoIDPattern, ROLES } = require("../../../../../utils/constants");
const {
  updateUserByAdminSchema,
} = require("../../../validators/admin/user.schema");

class UserController extends Controller {
  // ADMIN ROUTES :
  async getAllUsers(req, res) {
    let { page, limit } = req.query;
    page = page || 1;
    limit = limit || 20;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const searchTerm = new RegExp(search, "ig");
    // const databaseQuery = {};
    // if (search) databaseQuery["$text"] = { $search: search };
    const users = await UserModel.find({
      $or: [
        { name: searchTerm },
        { email: searchTerm },
        { phoneNumber: searchTerm },
      ],
    })
      .populate([
        {
          path: "Products",
          model: "Product",
        },
      ])
      .limit(limit)
      .skip(skip)
      .sort({
        createdAt: -1,
      });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        users,
      },
    });
  }
  async userProfile(req, res) {
    const { userId } = req.params;
    const user = await UserModel.findById(userId, { otp: 0 });
    const cart = (await getUserCartDetail(userId))?.[0];
    const payments = await PaymentModel.find({ user: userId });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        user,
        payments,
        cart,
      },
    });
  }
  async updateUser(req, res) {
    const { userId } = req.params;
    const target = await this.findUserById(userId);
    const data = await updateUserByAdminSchema.validateAsync(req.body);
    // An admin locking themselves out could leave the shop with no admin.
    if (req.user._id.equals(userId))
      throw createError.BadRequest("امکان تغییر وضعیت یا نقش خودتان وجود ندارد");
    // Blocking would take the main admin's access away just like a demotion.
    const changesMainAdmin =
      target.isMainAdmin &&
      ((data.role && data.role !== target.role) || data.isBlocked === true);
    if (changesMainAdmin)
      throw createError.Forbidden("امکان تغییر نقش یا وضعیت ادمین اصلی وجود ندارد");

    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true, projection: { otp: 0 } }
    );
    // Two admins demoting each other at once both pass any check made before
    // the write, so check after it and undo this write if no admin is left.
    const removesAdmin =
      target.role === ROLES.ADMIN &&
      !target.isBlocked &&
      (data.role === ROLES.USER || data.isBlocked === true);
    if (removesAdmin && !(await this.hasActiveAdmin())) {
      await UserModel.updateOne(
        { _id: userId, ...data },
        { $set: { role: target.role, isBlocked: target.isBlocked } }
      );
      throw createError.Conflict("حداقل یک ادمین فعال باید وجود داشته باشد");
    }
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "اطلاعات کاربر با موفقیت به روز رسانی شد",
        user,
      },
    });
  }
  async hasActiveAdmin() {
    return !!(await UserModel.exists({
      role: ROLES.ADMIN,
      isBlocked: { $ne: true },
    }));
  }
  async findUserById(id) {
    if (!MongoIDPattern.test(id))
      throw createError.BadRequest("شناسه کاربر صحیح نمی باشد");
    const user = await UserModel.findById(id);
    if (!user) throw createError.NotFound("کاربری با این مشخصات یافت نشد");
    return user;
  }
}

module.exports = {
  UserController: new UserController(),
};
