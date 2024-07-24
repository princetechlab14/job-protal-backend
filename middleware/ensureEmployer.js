const { sendErrorResponse } = require("../utils/responseUtils");

// Middleware to check if the user is an employee
exports.ensureEmployer = (req, res, next) => {
  if (req.user.userType !== "employer") {
    return sendErrorResponse(
      res,
      { message: "Employee cannot access this API" },
      403
    );
  }
  next();
};
