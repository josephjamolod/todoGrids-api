const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const connectDB = require("./connectDb/connect");

// CORS Configuration
const corsOptions = {
  origin: ["https://todo-grids.vercel.app"], // Replace with your client deployment URL
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Import routes
const authUser = require("./routes/auth");
const resetPass = require("./routes/resetPassword");
const userTask = require("./routes/task");

// Use routes
app.use("/api/auth", authUser);
app.use("/api/reset-password", resetPass);
app.use("/api/task", userTask);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
