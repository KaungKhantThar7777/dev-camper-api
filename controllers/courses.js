const asyncHandler = require("../middleware/asyncHandler");
const Course = require("../models/Courses");
const Bootcamp = require("../models/Bootcamps");
const ErrorResponse = require("../utils/errorResponse");

//@desc     Get Courses
//@route    /api/v1/courses
//@route    /api/v1/bootcamps/:bootcampId/courses
//@access   Public
const getCourses = asyncHandler(async (req, res) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

//@desc     Get Courses
//@route    /api/v1/courses/:id
//@access   Public
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    next(new ErrorResponse(404, `Cannot find course with ${req.params.id}`));
  } else {
    res.status(200).json({ success: true, data: course });
  }
});

//@desc     Get Courses
//@route    /api/v1/bootcamps/:bootcampId/courses
//@access   Private
const addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user._id;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        404,
        `No bootcamp with bootcampId ${req.params.bootcampId}`
      )
    );
  }

  //check permission
  if (!bootcamp.user.toString() && req.user.role !== "admin") {
    return next(new ErrorResponse(404, `Only bootcamp owner can add course`));
  }
  const course = await Course.create(req.body);
  res.status(201).json({
    success: true,
    data: course,
  });
});

//@desc     Update course
//@route    /api/v1/courses/:id
//@access   Private
const updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(404, `Cannot find course with ${req.params.id}`)
    );
  }

  if (course.user.toString() !== req.user._id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(404, `Only course owner can update the course`)
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: true,
    data: course,
  });
});

//@desc     Delete course
//@route    /api/v1/courses/:id
//@access   Private
const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(404, `Cannot find course with ${req.params.id}`)
    );
  }

  if (
    course.user.toString() !== req.user.id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(
      new ErrorResponse(404, `Only course owner can delete the course`)
    );
  }
  await course.remove();

  const count = await Course.countDocuments();

  console.log(count);
  res.status(200).json({
    success: true,
    data: course,
  });
});

module.exports = {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
};
