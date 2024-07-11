const jwt = require("jsonwebtoken");
const { sendErrorResponse } = require("../utils/responseUtils.js");

// Middleware to authenticate JWT token
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  console.log(authHeader);
  if (!token) {
    return sendErrorResponse(
      res,
      { status: false, message: "Unauthorized" },
      401
    ); // Unauthorized if token is not provided
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return sendErrorResponse(
          res,
          { status: false, message: "Login Again" },
          401
        ); // Token expired error
      }
      console.error("JWT verification error:", err);
      return sendErrorResponse(
        res,
        { status: false, message: "Unauthorized" },
        401
      ); // Unauthorized if token is invalid
    }
    req.user = user; // Attach user information to request object
    next(); // Proceed to the next middleware or route handler
  });
};
