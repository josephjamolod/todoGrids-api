const User = require("../models/user.model");
const { sendResetPasswordMail } = require("../nodeMailer/sendResetPassMail");
const errorhandler = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");

const requestResetPass = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(errorhandler(404, "Please provide an email"));
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorhandler(404, "User does not exist"));
    }
    const token = await jwt.sign(
      { userID: user._id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "5m" }
    );
    const currentTime = new Date();

    const lastResetPasswordEmailSent = user.lastEmailSent || new Date(0); // Default to epoch time if field not set

    // Calculate the difference in milliseconds between the current time and the last reset password email sent time
    const timeDiffInMillis = currentTime - lastResetPasswordEmailSent;

    // Check if enough time has passed since the last reset password email was sent (7 days = 7 * 24 * 60 * 60 * 1000 milliseconds)
    const sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000;
    if (timeDiffInMillis < sevenDaysInMillis) {
      return next(
        errorhandler(
          400,
          "You can only request reset password once every seven days"
        )
      );
    }

    await User.findByIdAndUpdate(
      user,
      {
        $set: {
          lastEmailSent: new Date(),
        },
      },
      { new: true }
    );

    sendResetPasswordMail({
      name: user.name,
      email: user.email,
      _id: user._id,
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    };
    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
    }

    res
      .cookie("reset_token", token, cookieOptions)
      .status(200)
      .json({ msg: "Email sent! Check your inbox or spam folder." });
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  const { userID, name } = req.user;
  const { newPassword, confirmPassword } = req.body;

  if (userID !== req.params.id) {
    return next(errorhandler(401, "Unauthorized User2"));
  }
  if (!newPassword || !confirmPassword) {
    return next(errorhandler(401, "Please fill both field"));
  }
  if (newPassword.trim() !== confirmPassword.trim()) {
    return next(
      errorhandler(401, "Password and confirm password does not match")
    );
  }
  if (newPassword.length < 8) {
    return next(
      errorhandler(403, "New password must be atleast 8 character long")
    );
  }
  const user = await User.findById({ _id: req.params.id });
  if (!user) {
    return next(errorhandler(404, "User cannot be found"));
  }
  const comparePassword = await user.comparePassword(newPassword.trim());
  if (comparePassword) {
    return next(
      errorhandler(
        403,
        "New Password should not be the same as the old password"
      )
    );
  }
  try {
    const updatedUserPassword = await User.findByIdAndUpdate(
      user,
      {
        $set: {
          password: newPassword.trim(),
        },
      },
      { new: true }
    );
    res.status(201).json({ msg: "Password successfully reset" });
  } catch (error) {
    next(error);
  }
};

module.exports = { requestResetPass, resetPassword };
