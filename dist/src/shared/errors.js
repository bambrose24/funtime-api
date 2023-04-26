'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
exports.UnauthorizedError =
  exports.UserNotFoundError =
  exports.ParamMissingError =
  exports.CustomError =
    void 0;
const http_status_codes_1 = __importDefault(require('http-status-codes'));
class CustomError extends Error {
  HttpStatus = http_status_codes_1.default.BAD_REQUEST;
  constructor(msg, httpStatus) {
    super(msg);
    this.HttpStatus = httpStatus;
  }
}
exports.CustomError = CustomError;
class ParamMissingError extends CustomError {
  static Msg = 'One or more of the required parameters was missing.';
  static HttpStatus = http_status_codes_1.default.BAD_REQUEST;
  constructor() {
    super(ParamMissingError.Msg, ParamMissingError.HttpStatus);
  }
}
exports.ParamMissingError = ParamMissingError;
class UserNotFoundError extends CustomError {
  static Msg = 'A user with the given id does not exists in the database.';
  static HttpStatus = http_status_codes_1.default.NOT_FOUND;
  constructor() {
    super(UserNotFoundError.Msg, UserNotFoundError.HttpStatus);
  }
}
exports.UserNotFoundError = UserNotFoundError;
class UnauthorizedError extends CustomError {
  static Msg = 'Login failed';
  static HttpStatus = http_status_codes_1.default.UNAUTHORIZED;
  constructor() {
    super(UnauthorizedError.Msg, UnauthorizedError.HttpStatus);
  }
}
exports.UnauthorizedError = UnauthorizedError;
