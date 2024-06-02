const jwt = require("jsonwebtoken");
const errorhandler = require("./errorHandler");

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(errorhandler(401, "Unauthorize User"));
  }
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  try {
    req.user = { userID: payload.userID, name: payload.name };
    next();
  } catch (error) {
    return next(error);
  }
};

const checkToken = (req, res, next) => {
  const token = req.cookies.access_token;
  console.log(req.cookies);
  try {
    if (!token) {
      return res.status(200).json({ msg: "No token" });
    } else {
      return res.status(200).json({ msg: "Token present" });
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { verifyToken, checkToken };
