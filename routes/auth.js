const express = require("express");
const {
  signUp,
  signIn,
  google,
  getUser,
  signOutUser,
  deleteUser,
  updateUser,
} = require("../controllers/auth.controller");
const { verifyToken, checkToken } = require("../utils/verifyToken");
const { verifyEmail } = require("../utils/verifyEmail");
const router = express.Router();

router.route("/check-token").get(checkToken);
router.route("/sign-up").post(signUp);
router.route("/verify-email").patch(verifyEmail);
router.route("/sign-in").post(signIn);
router.route("/google").post(google);
router.route("/getUser/:id").get(verifyToken, getUser);
router.route("/sign-out/:id").get(verifyToken, signOutUser);
router.route("/delete-user/:id").delete(verifyToken, deleteUser);
router.route("/update-user/:id").patch(verifyToken, updateUser);

module.exports = router;
