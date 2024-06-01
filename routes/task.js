const express = require("express");
const {
  createTask,
  getTask,
  deleteTask,
  updateTask,
} = require("../controllers/task.controller");
const { verifyToken } = require("../utils/verifyToken");
const router = express.Router();

router.route("/create-task/:id").post(verifyToken, createTask);
router.route("/get-task/:id").get(verifyToken, getTask);
router.route("/delete-task/:id").delete(verifyToken, deleteTask);
router.route("/update-task/:id").patch(verifyToken, updateTask);

module.exports = router;
