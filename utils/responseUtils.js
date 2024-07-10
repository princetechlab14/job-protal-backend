// utils/responseUtils.js

exports.sendSuccessResponse = (res, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data,
  });
};

exports.sendErrorResponse = (res, message, statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    error: message,
  });
};
