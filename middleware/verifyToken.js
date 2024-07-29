const jwt = require("jsonwebtoken");
const { sendErrorResponse } = require("../utils/responseUtils.js");

// Middleware to authenticate JWT token
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return sendErrorResponse(
      res,
      { statusCode: 401, status: false, message: "No Token provided" },
      401
    );
  }
  console.log("url ===============>", req.originalUrl);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return sendErrorResponse(
          res,
          { statusCode: 401, status: false, message: "Login Again" },
          401
        );
      }
      console.error("JWT verification error:", err);
      return sendErrorResponse(
        res,
        { statusCode: 401, status: false, message: "Unauthorized" },
        401
      );
    }
    req.user = user;
    next();
  });
};
