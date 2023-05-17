const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  err.statusCode = err.statusCode || 500;

  console.log(err);

  if (err.name === 'SequelizeDatabaseError') {
    error = new ErrorResponse(`Resource not found`, 404);
  }

  res.status(err.statusCode).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler;
