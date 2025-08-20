// backend/src/middleware/errorHandler.js
const ApiError = require("../utils/apiError");

const errorHandler = (err, req, res, next) => {
  // Log the error
  console.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // If it's already an ApiError, use it
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle Prisma specific errors
  if (err.code === "P2002") {
    const apiError = ApiError.conflict("Unique constraint violation");
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  if (err.code === "P2025") {
    const apiError = ApiError.notFound("Record not found");
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  if (err.code === "P2003") {
    const apiError = ApiError.badRequest("Foreign key constraint failed");
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    const apiError = ApiError.badRequest("Validation Error: " + err.message);
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    const apiError = ApiError.unauthorized("Invalid token");
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  if (err.name === "TokenExpiredError") {
    const apiError = ApiError.unauthorized("Token expired");
    return res.status(apiError.statusCode).json(apiError.toJSON());
  }

  // For any other error, create a generic internal server error
  const apiError = ApiError.internal("Something went wrong");
  return res.status(apiError.statusCode).json(apiError.toJSON());
};

// Handle 404 routes
const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Route ${req.originalUrl} not found`);
  res.status(error.statusCode).json(error.toJSON());
};

module.exports = {
  errorHandler,
  notFound,
};
