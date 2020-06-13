const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const path = require("path");
const asyncHandler = require("../middleware/asyncHandler");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//@desc     register user
//@route    /api/v1/auth/register
//@access   Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, role, password } = req.body;

  const user = await User.create({ name, email, role, password });
  if (!user) {
    next(err);
  }
  sendTokenCookie(user, 200, res);
});

//@desc     login user
//@route    /api/v1/auth/login
//@access   Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new ErrorResponse(404, "Please provide email and password"));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse(404, `Enter valid credentials`));
  }

  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse(404, `Enter valid credentials`));
  }

  sendTokenCookie(user, 200, res);
});

//@desc     Get logged in user
//@route    /api/v1/auth/register
//@access   Public
const getMe = asyncHandler(async (req, res, next) => {
  console.log("user", req.user);
  res.status(200).json({
    success: true,
    me: req.user,
  });
});

//@desc     log out user
//@route    /api/v1/auth/register
//@access   private
const logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
  });

  res.status(200).json({
    success: true,
    token: {},
  });
});

//@desc     Update user details
//@route    /api/v1/auth/updatedetails
//@access   Public
const updateDetails = asyncHandler(async (req, res, next) => {
  const filesToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, filesToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     Update user password
//@route    /api/v1/auth/updatepassword
//@access   Public
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse(401, "Incorrect password"));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenCookie(user, 200, res);
});

//@desc     Forget password
//@route    /api/v1/auth/forgotpassword
//@access   Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(404, "There is no user with that email"));
  }

  const resetToken = user.getResetPasswordToken();

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has request the reset password link.
  You can ignore  this email if you didn't sent a request`;

  const html = ` Please PUT request to this url <a>${resetUrl}<a>`;
  await user.save({ validateBeforeSave: false });
  try {
    await sendEmail({
      email: user.email,
      subject: "Reset Password Token",
      message,
      html,
    });

    res.status(200).json({ success: true, data: "Email was sent" });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse(500, "Email could not be sent"));
  }
});

//@desc     Reset password
//@route    PUT /api/v1/auth/resetpassword/:resetToken
//@access   Public
const resetPassword = asyncHandler(async (req, res, next) => {
  console.log(req.params);
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse(404, "Invalid Token"));
  }

  //set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendTokenCookie(user, 200, res);
});

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
  logout,
};

//get token from model and sent token cookie
function sendTokenCookie(user, statusCode, res) {
  const token = user.getJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
}
