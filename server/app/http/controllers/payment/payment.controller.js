const createHttpError = require("http-errors");
const Controller = require("../controller");
const {
  getUserCartDetail,
  invoiceNumberGenerator,
  secretKeyGenerator,
} = require("../../../../utils/functions");
const { PaymentModel } = require("../../../models/payment");
const { UserModel } = require("../../../models/user");
const { CouponModel } = require("../../../models/coupon");
const moment = require("moment-jalali");
const { ProductModel } = require("../../../models/product");
const { StatusCodes: HttpStatus } = require("http-status-codes");

class PaymentController extends Controller {
  async createPayment(req, res) {
    const user = req.user;
    if (!user.cart?.products || user.cart?.products.length === 0)
      throw createHttpError.BadRequest("سبد خرید شما خالی میباشد");
    await this.checkCartInStock(user.cart.products);
    const cart = (await getUserCartDetail(user._id))?.[0];
    if (!cart?.payDetail)
      throw createHttpError.BadRequest("مشخصات پرداخت یافت نشد");

    const amount = parseInt(cart?.payDetail?.totalPrice);
    const description = cart?.payDetail?.description;

    // create verified Course
    await PaymentModel.create({
      invoiceNumber: invoiceNumberGenerator(),
      paymentDate: moment().format("jYYYYjMMjDDHHmmss"),
      amount,
      user: user._id,
      description,
      authority: secretKeyGenerator(),
      status: "COMPLETED",
      isPaid: true,
      cart,
    });
    // add course to the use enrolledCourses
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          Products: [...(cart?.payDetail?.productIds || []), ...user.Products],
          cart: {
            products: [],
          },
        },
      }
    );

    // decrease products inStock :
    await ProductModel.updateMany(
      { _id: { $in: cart?.payDetail?.productIds } },
      {
        $inc: { countInStock: -1 },
      }
    );
    // update Coupon
    if (cart?.coupon)
      await CouponModel.updateOne(
        { _id: cart?.coupon?._id },
        {
          $inc: { usageCount: 1 },
        }
      );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "سفارش شما با موفقیت ثبت شد",
      },
    });
  }
  // Every line must still exist and fit in stock before anything is written
  // (FR-API-01).
  async checkCartInStock(cartProducts) {
    const products = await ProductModel.find(
      { _id: { $in: cartProducts.map((line) => line.productId) } },
      { title: 1, countInStock: 1 }
    );
    for (const line of cartProducts) {
      const product = products.find((p) => p._id.equals(line.productId));
      if (!product)
        throw createHttpError.BadRequest(
          "یکی از محصولات سبد خرید دیگر موجود نیست"
        );
      if (line.quantity > product.countInStock)
        throw createHttpError.BadRequest(
          `موجودی ${product.title} کافی نیست`
        );
    }
  }
  async getListOfPayments(req, res) {
    const payments = await PaymentModel.find({}).populate([
      {
        path: "user",
        model: "User",
        select: { name: 1, email: 1, phoneNumber: 1 },
      },
    ]);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        payments,
      },
    });
  }
  async getOnePayment(req, res) {
    const { id } = req.params;
    const payment = await PaymentModel.find({ _id: id }).populate([
      {
        path: "user",
        model: "User",
        select: { name: 1, email: 1, phoneNumber: 1 },
      },
    ]);
    if (!payment)
      throw createHttpError.NotFound("سفارشی با این مشخصات پیدا نشد");

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        payment,
      },
    });
  }
}

module.exports = {
  PaymentController: new PaymentController(),
};
