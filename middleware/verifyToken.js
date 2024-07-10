const jwt = require("jsonwebtoken");
const {
  sendSuccessResponse,
  sendErrorResponse,
} = require("../utils/responseUtils.js");
// Middleware to authenticate JWT token
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return sendErrorResponse(
      res,
      { status: false, message: "Unauthorized" },
      400
    ); // Unauthorized if token is not provided
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT verification error:", err);
      return sendErrorResponse(
        res,
        { status: false, message: "Unauthorized" },
        400
      ); // Unauthorized if token is not provided
    }
    req.user = user; // Attach user information to request object
    next(); // Proceed to the next middleware or route handler
  });
};
