const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  if (err.name === "CastError") {
    let message = `Resource cannot be found}`;
    error = new ErrorResponse(404, message);
  }

  if (err.code === 11000) {
    let message = "Duplicate filed value entered";
    error = new ErrorResponse(400, message);
  }

  if (err.name === "ValidationError") {
    let message = Object.values(err.errors).map((error) => error.message);
    error = new ErrorResponse(400, message);
  }
  console.log(err);
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
  });
};

module.exports = errorHandler;
