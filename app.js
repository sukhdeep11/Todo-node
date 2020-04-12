const express = require("express");
const app = express();

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRoutes = require("./routes/userRoutes");

// 2) MIDDLEWARE
app.use(express.json());

// 3) ROUTES
app.use("/api/v1/users", userRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this Server! `, 404));
});

app.use(globalErrorHandler);

module.exports = app;
