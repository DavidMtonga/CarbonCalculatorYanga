// backend/src/utils/apiError.js
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = "") {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Static method to create common error types
  static badRequest(message = "Bad Request") {
    return new ApiError(400, message);
  }

  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }

  static paymentRequired(message = "Payment Required") {
    return new ApiError(402, message);
  }

  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }

  static notFound(message = "Not Found") {
    return new ApiError(404, message);
  }

  static methodNotAllowed(message = "Method Not Allowed") {
    return new ApiError(405, message);
  }

  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }

  static gone(message = "Gone") {
    return new ApiError(410, message);
  }

  static unprocessableEntity(message = "Unprocessable Entity") {
    return new ApiError(422, message);
  }

  static tooManyRequests(message = "Too Many Requests") {
    return new ApiError(429, message);
  }

  static internal(message = "Internal Server Error") {
    return new ApiError(500, message);
  }

  static notImplemented(message = "Not Implemented") {
    return new ApiError(501, message);
  }

  static badGateway(message = "Bad Gateway") {
    return new ApiError(502, message);
  }

  static serviceUnavailable(message = "Service Unavailable") {
    return new ApiError(503, message);
  }

  static gatewayTimeout(message = "Gateway Timeout") {
    return new ApiError(504, message);
  }

  // Method to convert error to JSON response format
  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      name: this.name,
      message: this.message,
      timestamp: this.timestamp,
      ...(process.env.NODE_ENV === "development" && {
        stack: this.stack,
        isOperational: this.isOperational,
      }),
    };
  }

  // Method to format error for logging
  toLog() {
    return {
      name: this.name,
      statusCode: this.statusCode,
      message: this.message,
      stack: this.stack,
      timestamp: this.timestamp,
      isOperational: this.isOperational,
    };
  }
}

export default ApiError;
