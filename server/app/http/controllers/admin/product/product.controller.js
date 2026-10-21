const Controller = require("../../controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const mongoose = require("mongoose");
const {
  computeOffPrice,
  copyObject,
  deleteInvalidPropertyInObject,
} = require("../../../../../utils/functions");
const createHttpError = require("http-errors");
// const { CommentController } = require("../../comment/comment.controller");
const ObjectId = mongoose.Types.ObjectId;
const { CategoryModel } = require("../../../../models/category");
const { UserModel } = require("../../../../models/user");
const { ProductModel } = require("../../../../models/product");
const {
  addProductSchema,
  changeCourseDiscountSchema,
  productListQuerySchema,
} = require("../../../validators/admin/product.schema");

class ProductController extends Controller {
  async addNewProduct(req, res) {
    // const seller = req.user._id;
    await addProductSchema.validateAsync(req.body);
    const {
      title,
      description,
      slug,
      imageLink,
      brand,
      tags,
      category,
      price,
      discount = 0,
      countInStock,
    } = req.body;

    const product = await ProductModel.create({
      title,
      description,
      slug,
      imageLink,
      brand,
      tags,
      category,
      price,
      discount,
      offPrice: computeOffPrice(price, discount),
      countInStock,
    });
    if (!product?._id)
      throw createHttpError.InternalServerError("محصول ثبت نشد");
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "محصول با موفقیت ایجاد شد",
        product,
      },
    });
  }
  async getListOfProducts(req, res) {
    let dbQuery = {};
    const user = req.user;
    const { limit } = await productListQuerySchema.validateAsync(req.query);
    const { search, category, sort, type } = req.query;
    // console.log({ category, sort, type });
    if (search) dbQuery["$text"] = { $search: search };
    if (category) {
      // Unknown englishTitles are ignored; if none match, the $in is empty
      // and the list comes back empty. A non-string value (e.g. a parsed
      // `category[$ne]=x` object) matches nothing.
      const names = typeof category === "string" ? category.split(",") : [];
      const categories = await CategoryModel.find(
        { englishTitle: { $in: names } },
        { _id: 1 }
      );
      dbQuery["category"] = {
        $in: categories.map(({ _id }) => _id),
      };
    }

    // Unknown (or repeated) sort values fall back to the default, oldest
    // first. `_id` breaks ties so `limit` cuts the list at a stable place.
    const sortQuery = { createdAt: sort === "latest" ? -1 : 1, _id: 1 };

    const populateCategory = [
      { path: "category", select: { title: 1, englishTitle: 1 } },
    ];
    let loadProducts;
    if (sort === "popular") {
      // Sorting on `likes` directly orders by array element value, not by
      // length, so sort on the like count instead (FR-API-05).
      const pipeline = [
        { $match: dbQuery },
        { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort: { likesCount: -1, createdAt: -1, _id: 1 } },
        ...(limit ? [{ $limit: limit }] : []),
        { $project: { reviews: 0, likesCount: 0 } },
      ];
      loadProducts = ProductModel.aggregate(pipeline).then((docs) => {
        const hydrated = docs.map((doc) => ProductModel.hydrate(doc));
        return ProductModel.populate(hydrated, populateCategory);
      });
    } else {
      loadProducts = ProductModel.find(dbQuery, {
        reviews: 0,
      })
        .populate(populateCategory)
        .sort(sortQuery);
      if (limit) loadProducts = loadProducts.limit(limit);
    }
    const [products, total] = await Promise.all([
      loadProducts,
      limit ? ProductModel.countDocuments(dbQuery) : null,
    ]);

    const transformedProducts = copyObject(products);

    const newProducts = transformedProducts.map((product) => {
      product.likesCount = product.likes.length;
      product.isLiked = false;
      if (!user) {
        product.isLiked = false;
        delete product.likes;
        return product;
      }
      if (product.likes.includes(user._id.toString())) {
        product.isLiked = true;
      }
      delete product.likes;
      return product;
    });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        products: newProducts,
        ...(limit && {
          pagination: {
            page: 1,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        }),
      },
    });
  }
  async getProductById(req, res) {
    const { id: productId } = req.params;
    await this.findProductById(productId);
    const product = await ProductModel.findById(productId).populate([
      {
        path: "category",
        model: "Category",
        select: {
          title: 1,
          icon: 1,
          englishTitle: 1,
        },
      },
    ]);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        product,
      },
    });
  }
  async getOneProductBySlug(req, res) {
    const { slug } = req.params;
    const product = await ProductModel.findOne({ slug }).populate([
      {
        path: "category",
        model: "Category",
        select: {
          title: 1,
          icon: 1,
          englishTitle: 1,
        },
      },
    ]);

    if (!product)
      throw createHttpError.NotFound("دوره ای با این مشخصات یافت نشد");

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        product,
      },
    });
  }
  async changeProductDiscountStatus(req, res) {
    const { id } = req.params;
    const product = await this.findProductById(id);
    await changeCourseDiscountSchema.validateAsync(req.body);
    const { discount } = req.body;
    const result = await ProductModel.updateOne(
      { _id: id },
      { $set: { discount, offPrice: computeOffPrice(product.price, discount) } }
    );
    if (result.modifiedCount > 0) {
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: {
          message: "وضعیت تخفیف محصول فعال شد",
        },
      });
    }
    throw createHttpError.BadRequest("تغییر انجام نشد مجددا تلاش کنید");
  }
  async removeProduct(req, res) {
    const { id } = req.params;
    await this.findProductById(id);
    const deleteResult = await ProductModel.deleteOne({ _id: id });
    if (deleteResult.deletedCount == 0)
      throw createError.InternalServerError("حدف محصول انجام نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "حذف محصول با موفقیت انجام شد",
      },
    });
  }
  async updateProduct(req, res) {
    const { id } = req.params;
    const product = await this.findProductById(id);
    const data = copyObject(req.body);
    let blackListFields = ["bookmarks", "likes", "reviews", "offPrice"];
    deleteInvalidPropertyInObject(data, blackListFields);
    data.offPrice = computeOffPrice(
      data.price ?? product.price,
      data.discount ?? product.discount
    );
    const updateProductResult = await ProductModel.updateOne(
      { _id: id },
      {
        $set: data,
      }
    );
    if (!updateProductResult.modifiedCount)
      throw new createHttpError.InternalServerError(
        "به روزرسانی محصول انجام نشد"
      );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "به روزرسانی محصول با موفقیت انجام شد",
      },
    });
  }
  async likeProduct(req, res) {
    const { id: productId } = req.params;
    const user = req.user;
    const product = await this.findProductById(productId);
    const likedProduct = await ProductModel.findOne({
      _id: productId,
      likes: user._id,
    });
    const updateProductQuery = likedProduct
      ? { $pull: { likes: user._id } }
      : { $push: { likes: user._id } };

    const updateUserQuery = likedProduct
      ? { $pull: { likedProducts: product._id } }
      : { $push: { likedProducts: product._id } };

    const productUpdate = await ProductModel.updateOne(
      { _id: productId },
      updateProductQuery
    );
    const userUpdate = await UserModel.updateOne(
      { _id: user._id },
      updateUserQuery
    );

    if (productUpdate.modifiedCount === 0 || userUpdate.modifiedCount === 0)
      throw createHttpError.BadRequest("عملیات ناموفق بود.");

    let message;
    if (!likedProduct) {
      message = "مرسی بابت لایک تون";
    } else message = "لایک شما برداشته شد";

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  }
  async findProductById(id) {
    if (!mongoose.isValidObjectId(id))
      throw createHttpError.BadRequest("شناسه محصول ارسال شده صحیح نمیباشد");
    const product = await ProductModel.findById(id);
    if (!product) throw createHttpError.NotFound("محصولی یافت نشد.");
    return product;
  }
}

module.exports = {
  ProductController: new ProductController(),
};
