const express = require("express");
const router = express.Router();

const {
  requestResetPass,
  resetPassword,
} = require("../controllers/requestResetPass");
const { verifyResetToken } = require("../utils/verifyResetToken");

router.route("/request").post(requestResetPass);
router.route("/update/:id").post(verifyResetToken, resetPassword);

module.exports = router;
