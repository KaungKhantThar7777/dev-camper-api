const Bootcamp = require("../models/Bootcamps");
const ErrorResponse = require("../utils/errorResponse");
const geocoder = require("../utils/geocoder");
const path = require("path");

const asyncHandler = require("../middleware/asyncHandler");
const { compareSync } = require("bcryptjs");
//@desc     Get All BootCamps
//@route    /api/v1/bootcamps
//@access   Public
const getBootCamps = asyncHandler(async (req, res, next) => {
  console.log(res.advancedResults);
  res.status(200).json(res.advancedResults);
});

//@desc     Get Single BootCamp
//@route    /api/v1/bootcamps/:id
//@access   Public
const getBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    next(new ErrorResponse(404, `Cannot find bootcamp with ${req.params.id}`));
  } else {
    res.status(200).json({ success: true, bootcamp });
  }
});

//@desc     Get Single BootCamp
//@route    /api/v1/bootcamps/:id
//@access   Public
const createBootCamp = asyncHandler(async (req, res, next) => {
  //make req.user to req.body

  req.body.user = req.user._id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user._id });
  console.log(req.user);
  //ensure only one bootcamp can be published for publisher
  if (publishedBootcamp && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        404,
        `Only one bootcamp can be published for ${req.user.role} role`
      )
    );
  }

  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

//@desc     Get Single BootCamp
//@route    /api/v1/bootcamps/:id
//@access   Public
const updateBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAnd(req.params.id);

  if (!bootcamp) {
    return next(new ErrorResponse(404, `No bootcamp with id ${req.params.id}`));
  }

  //check permission
  if (bootcamp.checkPermit(req.user._id) && req.user.role !== "admin") {
    return next(
      new ErrorResponse(404, `Only owner can update published bootcamp`)
    );
  }

  await bootcamp.update(
    Update(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
  );
  res.status(201).json({ success: true, data: bootcamp });
});

//@desc     Delete bootcamp
//@route    /api/v1/bootcamps/:id
//@access   Public
const deleteBootCamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(404, `No bootcamp with id ${req.params.id}`));
  }

  //check permission
  console.log(bootcamp.checkPermit(req.user._id));
  if (!bootcamp.checkPermit(req.user._id) && req.user.role !== "admin") {
    return next(new ErrorResponse(404, `Not authorized to this route`));
  }

  bootcamp.remove();

  res.status(200).json({ success: true, data: bootcamp });
});

//@desc     Get BootCamps by distance
//@route    /api/v1/bootcamps/radius/:zipcode/:distance
//@access   Public
const getBootcampByRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  const [loc] = await geocoder.geocode(zipcode);
  const lat = loc.latitude;
  const long = loc.longitude;
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[long, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

//@desc     Upload bootcamp photo
//@route    /api/v1/bootcamps/:id/photo
//@access   Private
const uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  let { file } = req.files;

  //check permission
  if (!bootcamp.checkPermit(req.user._id) && req.user.role !== "admin") {
    return next(new ErrorResponse(404, `Not authorized to this route`));
  }

  if (!file.mimetype.startsWith("image")) {
    next(new ErrorResponse(404, "Please upload a photo"));
  }
  let maxSize = process.env.MAX_PHOTO_SIZE;
  if (file.size > maxSize) {
    next(
      new ErrorResponse(404, `Please upload a photo less than ${maxSize}kb.`)
    );
  }

  //custom file name
  file.name = `photo-${bootcamp._id}${path.parse(file.name).ext}`;

  //file upload
  file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.log(err);
      next(new ErrorResponse(500, "Problem with file upload"));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id, {
      photo: file.name,
    });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
module.exports = {
  getBootCamps,
  getBootCamp,
  createBootCamp,
  updateBootCamp,
  deleteBootCamp,
  getBootcampByRadius,
  uploadBootcampPhoto,
};
