const User = require("../models/user.model");
const errorhandler = require("./errorHandler");

const verifyEmail = async (req, res, next) => {
  const { emailToken } = req.body;
  if (!emailToken) {
    return next(errorhandler(404, "Email Token not found!"));
  }
  const user = await User.findOne({ emailToken });
  if (!user) {
    return next(errorhandler(404, "Email Token not found"));
  }
  try {
    const isVerified = true;
    const emailToken = null;
    const verifiedUser = await User.findByIdAndUpdate(
      user,
      {
        isVerified,
        emailToken,
      },
      { new: true }
    );
    return res.status(200).json({ isVerified: verifiedUser.isVerified });
  } catch (error) {
    return next(error);
  }
};

module.exports = { verifyEmail };
