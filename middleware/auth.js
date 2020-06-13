const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

const protect = asyncHandler(async (req, res, next) => {
  let token;
  let auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer")) {
    token = auth.split(" ")[1];
  }

  // else if (req.cookies.token){
  //     token = req.cookies.token
  // }

  if (!token) {
    return next(new ErrorResponse(401, "Not authorize to access this route"));
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decode.id);
    if (!req.user) {
      return next(new ErrorResponse(401, "Not authorize to access this route"));
    }
    next();
  } catch (err) {
    return next(new ErrorResponse(401, "Not authorize to access this route"));
  }
});

const authorize = (...role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          401,
          `User role ${req.user.role} is not authorized to access this route`
        )
      );
    }
    next();
  };
};

module.exports = {
  protect,
  authorize,
};
