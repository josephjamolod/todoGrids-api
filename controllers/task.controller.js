const Task = require("../models/task.model");
const errorhandler = require("../utils/errorHandler");
const mongoose = require("mongoose");

const createTask = async (req, res, next) => {
  const { title, task, important, completed } = req.body;
  const { userID } = req.user;
  if (userID !== req.params.id) {
    return next(errorhandler(403, "Unauthorize User"));
  }
  if (!task) {
    return next(errorhandler(403, "Please provide a task"));
  }
  try {
    const userRef = userID;
    const task = await Task.create({ ...req.body, userRef });
    res.status(201).json({ msg: "Task successfully created" });
  } catch (error) {
    return next(error);
  }
};

const getTask = async (req, res, next) => {
  const { userID } = req.user;
  if (userID !== req.params.id) {
    return next(errorhandler(401, "Unauthorize User1"));
  }
  const { searchTerm, task, completed, important, sort, startIndex } =
    req.query;
  if (!task && !completed && !important) {
    return res.status(200).json([]);
  }
  try {
    const queryObject = { userRef: userID };
    if (searchTerm) {
      queryObject.title = { $regex: searchTerm, $options: "i" };
    }
    if (task === "true") {
      queryObject.completed = false;
      queryObject.important = false;
    }
    if (completed === "true") {
      queryObject.completed = true;
    }
    if (important === "true") {
      queryObject.important = true;
    }

    if (Object.keys(queryObject).length === 0) {
      return res.status(200).json([]);
    }
    const tasks = await Task.find(queryObject)
      .sort(sort || "-createdAt")
      .limit(12)
      .skip(startIndex || 0);
    // console.log(tasks.length);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  const { userID } = req.user;
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorhandler(401, "Invalid ID format"));
  }
  const task = await Task.findById(req.params.id);
  // const task = await Task.find({ _id: req.params.id, userRef: userID });
  if (!task) {
    return next(errorhandler(404, "Task cannot be found"));
  }
  if (task.userRef !== userID) {
    return next(errorhandler(401, "You can only delete your own task"));
  }
  try {
    await Task.findByIdAndDelete(task);
    res.status(200).json({ msg: "Task successfully Deleted" });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  const { title, task, completed, important } = req.body;
  const { userID } = req.user;
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(errorhandler(401, "Invalid ID format"));
  }
  const taskData = await Task.findById(req.params.id);
  if (!taskData) {
    return next(errorhandler(404, "Task cannot be found"));
  }
  if (taskData.userRef !== userID) {
    return next(errorhandler(401, "You can only update your own task"));
  }
  try {
    const newTask = await Task.findByIdAndUpdate(
      taskData,
      {
        $set: {
          title,
          task,
          completed,
          important,
        },
      },
      { new: true }
    );
    res.status(200).json({ msg: "Task successfully updated" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTask, deleteTask, updateTask };
