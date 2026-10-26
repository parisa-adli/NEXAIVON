const createError = require("http-errors");
const { UserModel } = require("../../models/user");

function authorize(...allowedRoles) {
  return async function (req, res, next) {
    try {
      const userId = req.user._id;
      const user = await UserModel.findById(userId);
      if (allowedRoles.length === 0 || allowedRoles.includes(user.role))
        return next();
      throw createError.Forbidden("شما به این قسمت دسترسی ندارید");
    } catch (error) {
      next(error);
    }
  };
}

// Runs after authorize(ROLES.ADMIN); req.user is freshly loaded per request.
function requireMainAdmin(req, res, next) {
  if (req.user.isMainAdmin) return next();
  next(createError.Forbidden("فقط ادمین اصلی به این قسمت دسترسی دارد"));
}

module.exports = {
  authorize,
  requireMainAdmin,
};
