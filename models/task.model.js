const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    task: {
      type: String,
      require: [true, "Please provide task"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    important: {
      type: Boolean,
      default: false,
    },
    userRef: {
      type: String,
      require: [true, "No User Refference"],
    },
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
