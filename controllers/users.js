const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");

//@desc     Get Users
//@route    /api/v1/users
//@access   Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  res.status(200).json(res.advancedResults);
});

//@desc     Get single user
//@route    /api/v1/users/:id
//@access   Private/Admin
const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(404, `No such user with id ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     Create a user
//@route    /api/v1/users
//@access   Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

//@desc     Update a user
//@route    /api/v1/users/:id
//@access   Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     Delete user
//@route    /api/v1/users/:id
//@access   Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  await User.findByIdAndRemove(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
