const User = require("../models/user.model");
const {
  sendDefaultPasswordMail,
} = require("../nodeMailer/sendDefaultPasswordMail");
const { sendVerificationMail } = require("../nodeMailer/sendVerificationMail");
const errorhandler = require("../utils/errorHandler");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const signUp = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  if (!name || !email || !password || !confirmPassword) {
    return next(errorhandler(400, "Please provide all field"));
  }
  if (confirmPassword !== password) {
    return next(errorhandler(400, "Password does not match"));
  }
  const emailAlreadytExist = await User.findOne({ email });
  if (emailAlreadytExist) {
    return next(errorhandler(400, "Email already exist"));
  }
  try {
    const emailToken = await crypto.randomBytes(64).toString("hex");
    const user = await User.create({ ...req.body, emailToken });
    sendVerificationMail(user);
    return res.status(201).json("User Created");
  } catch (error) {
    return next(error);
  }
};

const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(errorhandler(400, "Please provide email and password"));
  }
  const user = await User.findOne({ email });

  if (!user) {
    return next(errorhandler(404, "User does not exist"));
  }
  if (!user.isVerified) {
    return next(
      errorhandler(
        403,
        "Email is not verified, please check your email for verification"
      )
    );
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(errorhandler(400, "Incorrect Password"));
  }
  try {
    const token = await user.createJWT();
    const userWithoutPassword = await User.findById(user).select("-password");
    const cookieOptions = {
      secure: true,
      httpOnly: true,
      sameSite: "None",
    };

    res
      .cookie("access_token", token, cookieOptions)
      .status(200)
      .json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

const google = async (req, res, next) => {
  const { email, photo, name } = req.body;
  const user = await User.findOne({ email });

  try {
    if (user) {
      if (!user.isVerified) {
        return next(
          errorhandler(
            403,
            "Email is not verified, please check your email for verification"
          )
        );
      }
      const token = await user.createJWT();
      const userWithoutPassword = await User.findById(user).select("-password");
      const cookieOptions = {
        secure: true,
        httpOnly: true,
        sameSite: "None",
      };
      if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
      }

      res
        .cookie("access_token", token, cookieOptions)
        .status(200)
        .json(userWithoutPassword);
    } else {
      const generatedPassword =
        Math.random().toString(36).slice(-8) +
        Math.random().toString(36).slice(-8);

      const newUser = await User.create({
        email,
        password: generatedPassword,
        name,
        avatar: photo,
        isVerified: true,
      });
      const token = await newUser.createJWT();
      const newUserWithoutPassword = await User.findById(newUser).select(
        "-password"
      );
      sendDefaultPasswordMail({ email, password: generatedPassword, name });
      //console.log({ ...newUserWithoutPassword, msg: "New User" });
      // console.log(newUserWithoutPassword);
      const cookieOptions = {
        secure: true,
        httpOnly: true,
        sameSite: "None",
      };
      if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
      }

      res
        .cookie("access_token", token, cookieOptions)
        .status(200)
        .json({
          ...newUserWithoutPassword.toObject(),
          message: "New User",
        });
    }
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  const { userID, name } = req.user;
  if (req.params.id !== userID) {
    return next(errorhandler(401, "Unauthorize User"));
  }
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(errorhandler(404, "User does not exist"));
    }
    const userWithoutPassword = await User.findById(user).select("-password");
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

const signOutUser = async (req, res, next) => {
  const { userID, name } = req.user;
  if (req.params.id !== userID) {
    return next(errorhandler(401, "Unauthorize User"));
  }
  const user = await User.findById(userID);

  try {
    if (!user) {
      return next(errorhandler(404, "User ID does not exist"));
    }
    res
      .clearCookie("access_token")
      .status(200)
      .json({ msg: "user successfully sign out" });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  const { userID, name } = req.user;
  if (userID !== req.params.id) {
    return next(errorhandler(401, "Unauthorize User"));
  }
  const user = await User.findById(req.params.id);
  try {
    if (!user) {
      return next(errorhandler(404, "User ID does not exist"));
    }
    await User.findByIdAndDelete(user);
    res
      .clearCookie("access_token")
      .status(200)
      .json({ msg: "User Successfuly deleted" });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  const { name, newPassword, currentPassword, avatar } = req.body;
  const { userID } = req.user;

  if (!name) {
    return next(errorhandler(404, "Please provide a name"));
  }
  if (newPassword && !currentPassword) {
    return next(errorhandler(404, "Please enter your current password"));
  }
  if (!newPassword && currentPassword) {
    return next(errorhandler(404, "Please enter new password"));
  }

  if (newPassword || currentPassword) {
    req.body.newPassword = await newPassword.trim();
    req.body.currentPassword = await currentPassword.trim();
  }
  if (req.params.id !== userID) {
    return next(errorhandler(401, "You can only update your own profile"));
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(errorhandler(404, "User ID does not exist"));
  }
  if (currentPassword) {
    const comparePassword = await user.comparePassword(
      req.body.currentPassword
    );
    if (!comparePassword) {
      return next(
        errorhandler(401, "Current password incorrect. Please try again")
      );
    }
  }
  if (newPassword && newPassword.length <= 8) {
    return next(
      errorhandler(400, "Password must be more than 8 characters long")
    );
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      user,
      {
        $set: {
          name: name.trim(),
          password: req.body.newPassword,
          avatar: avatar,
        },
      },
      { new: true }
    );
    const updatedUserWithoutPassword = await User.findById(updatedUser).select(
      "-password"
    );
    res.status(200).json(updatedUserWithoutPassword);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signUp,
  signIn,
  google,
  getUser,
  signOutUser,
  deleteUser,
  updateUser,
};

//
