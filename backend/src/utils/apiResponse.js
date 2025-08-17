class ApiResponse {
  constructor(res, statusCode, message, data = null) {
    this.res = res;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400;

    res.status(statusCode).json({
      success: this.success,
      message,
      data,
    });
  }
}

export default ApiResponse;
