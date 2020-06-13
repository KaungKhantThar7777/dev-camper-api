const express = require("express");
const router = express.Router();

//Controller functions
const {
  getBootCamps,
  getBootCamp,
  createBootCamp,
  updateBootCamp,
  deleteBootCamp,
  getBootcampByRadius,
  uploadBootcampPhoto,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamps");
const advancedResults = require("../middleware/advancedResults");

//load other resources
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

const { protect, authorize } = require("../middleware/auth");

router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router
  .route("/")
  .get(
    advancedResults(Bootcamp, { path: "courses", select: "name" }),
    getBootCamps
  )
  .post(protect, authorize("publisher", "admin"), createBootCamp);
router.route("/radius/:zipcode/:distance").get(getBootcampByRadius);

router
  .route("/:id")
  .get(getBootCamp)
  .put(protect, authorize("publisher", "admin"), updateBootCamp)
  .delete(protect, authorize("publisher", "admin"), deleteBootCamp);

router
  .route("/:id/photo")
  .patch(protect, authorize("publisher", "admin"), uploadBootcampPhoto);
module.exports = router;
