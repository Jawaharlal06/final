

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message); // sets this.message
    this.statusCode = statusCode;
    this.success = false;

    // Maintains proper stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
//module.exports = ApiError;
