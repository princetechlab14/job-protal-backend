const { sendErrorResponse } = require("../utils/responseUtils");

exports.ensureEmployee = (req, res, next) => {
  if (req.user.userType !== "employee") {
    return sendErrorResponse(res, "Employer cannot access this API", 403);
  }
  next();
};
