const asyncHandler = require("../middleware/asyncHandler");
const Review = require("../models/Reviews");
const Bootcamp = require("../models/Bootcamps");

const ErrorResponse = require("../utils/errorResponse");

//@desc     Get All Reviews
//@route    /api/v1/reviews
//@route    /api/v1/bootcamps/:bootcampId/reviews
//@access   Public
const getReviews = asyncHandler(async (req, res) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({
      bootcamp: req.params.bootcampId,
    }).populate({
      path: "bootcamp",
      select: "name description",
    });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc     Get All Reviews
//@route    /api/v1/reviews/:id
//@access   Public
const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(404, `No review was found with id ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

//@desc     Create a review
//@route    /api/v1/reviews/bootcamps/:bootcampId/reviews
//@access   Private
const addReview = asyncHandler(async (req, res, next) => {
  console.log(req.user);
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        404,
        `No bootcamp was found with id ${req.params.bootcampId}`
      )
    );
  }

  req.body.bootcamp = bootcamp._id;
  req.body.user = req.user._id;

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

//@desc     Update Review
//@route    /api/v1/reviews/:id
//@access   Public
const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(404, `No review with id ${req.params.id}`));
  }
  console.log(typeof req.user._id, typeof review.user);

  //check only review owner and admin update review
  if (
    req.user._id.toString() !== review.user.toString() &&
    req.user.rold !== "admin"
  ) {
    return next(
      new ErrorResponse(
        404,
        `Only owner can update review with id ${req.params.id}`
      )
    );
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    daa: review,
  });
});

//@desc     Delete Review
//@route    /api/v1/reviews/:id
//@access   Public
const deleteReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse(404, `No review with id ${req.params.id}`));
  }

  //check only review owner and admin update review
  if (
    req.user._id.toString() !== review.user.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(
        404,
        `Only owner can delete review with id ${req.params.id}`
      )
    );
  }

  await review.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});

module.exports = {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
};
