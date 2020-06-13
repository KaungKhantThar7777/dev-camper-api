const fs = require("fs");
const dotenv = require("dotenv");
const colors = require("colors");
const mongoose = require("mongoose");

//load config file
dotenv.config({ path: "./config/config.env" });

//load model
const Bootcamp = require("./models/Bootcamps");
const Course = require("./models/Courses");
const User = require("./models/User");
const Review = require("./models/Reviews");

//db connected
mongoose.connect(process.env.MONGO_URL, {
  useCreateIndex: true,
  useFindAndModify: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//load resources
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
);
const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
);
//import to database
const importData = async () => {
  try {
    await Bootcamp.create(bootcamps);
    await Course.create(courses);
    await User.create(users);
    await Review.create(reviews);
    console.log("Data imported".green.inverse);
  } catch (error) {
    console.error(error);
  }
  process.exit();
};

const destroyData = async () => {
  await Bootcamp.deleteMany();
  await Course.deleteMany();
  await User.deleteMany();
  await Review.deleteMany();
  console.log("Data deleted".red.inverse);
  process.exit();
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  destroyData();
}
