const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const cors = require("cors");
const path = require("path");

app.options(
  "*",
  cors({
    origin: "https://todo-app-lake-two-69.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Apply CORS middleware
app.use(
  cors({
    origin: "https://todo-app-lake-two-69.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

require("dotenv").config();

const authUser = require("./routes/auth");
const resetPass = require("./routes/resetPassword");
const userTask = require("./routes/task");
const connectDB = require("./connectDb/connect");

const dirname = path.resolve();

//middleware to access req.body
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authUser);
app.use("/api/reset-password", resetPass);
app.use("/api/task", userTask);

app.use(express.static(path.join(dirname, "/client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(dirname, "client", "dist", "index.html"));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || " Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => console.log(`server is listening to port ${PORT} `));
  } catch (error) {
    console.log(error);
  }
};

start();
