// utils/apiResponse.js

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
//module.exports = ApiResponse;
