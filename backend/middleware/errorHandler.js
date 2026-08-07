const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    // Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      error = new ApiError(400, 'Validation failed', messages);
    }
    // Mongoose duplicate key error
    else if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      error = new ApiError(409, `${field} already exists`);
    }
    // Mongoose invalid ObjectId
    else if (error.name === 'CastError') {
      error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
    }
    // JWT errors
    else if (error.name === 'JsonWebTokenError') {
      error = new ApiError(401, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      error = new ApiError(401, 'Token expired');
    } else {
      const statusCode = error.statusCode || 500;
      error = new ApiError(statusCode, error.message || 'Internal server error');
    }
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
