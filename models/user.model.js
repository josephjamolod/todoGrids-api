const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      unique: [true, "Email already exist"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
    },
    avatar: {
      type: String,
      default:
        "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailToken: {
      type: String,
    },
    lastEmailSent: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.pre("findOneAndUpdate", async function (next) {
  // Check if the update operation includes updating the password
  if (this._update.$set && this._update.$set.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(
        this._update.$set.password,
        salt
      );
      this._update.$set.password = hashedPassword; // Update the password with the hashed value
    } catch (error) {
      return next(error);
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  const passwordMatch = await bcrypt.compare(candidatePassword, this.password);
  return passwordMatch;
};

userSchema.methods.createJWT = async function () {
  const token = await jwt.sign(
    { userID: this._id, name: this.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_LIFETIME }
  );
  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
