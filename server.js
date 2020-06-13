const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const path = require("path");
var xss = require("xss-clean");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const connect = require("./config/db");
const mongoSanitize = require("express-mongo-sanitize");

//Get Env Const
dotenv.config({
  path: "./config/config.env",
});

connect();

//All Routes
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

//public static folder
app.use(express.static(path.join(__dirname, "public")));

//middlware logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//file upload middleware
app.use(fileUpload());

//sanitize data
app.use(mongoSanitize());

//cookie parser middleware
app.use(cookieParser());

//add more secure header
app.use(helmet());

//clean xss
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());
//Moute Routes

app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(errorHandler);

const server = app.listen(
  PORT,
  console.log(
    `Server is listening in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  )
);

//handle unhandledRejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);

  server.close(() => process.exit(1));
});
