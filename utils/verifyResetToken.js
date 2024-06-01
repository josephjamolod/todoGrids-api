const jwt = require("jsonwebtoken");
const errorhandler = require("./errorHandler");

const verifyResetToken = async (req, res, next) => {
  try {
    const token = req.cookies.reset_token;
    if (!token) {
      return next(errorhandler(404, "Unauthorized User "));
    }
    const payload = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userID: payload.userID, name: payload.name };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(errorhandler(401, "Token has expired"));
    }
    return next(error);
  }
};

module.exports = { verifyResetToken };
