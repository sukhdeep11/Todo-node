const { promisify } = require("util");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordCreatedAt: req.body.passwordCreatedAt,
  });

  const token = signToken(newUser._id);
  res.status(201).json({
    status: "success",
    data: {
      token,
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    next(new AppError(`please provide Email and password`, 400));
  }

  // 2) Check if email and password exists and correct
  user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError(`Email or Password is wrong`, 401));
  }
  // 3) If everything ok send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

exports.protected = catchAsync(async (req, res, next) => {
  let token;
  // 1) Get token and check wheter it's there

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in Please logged In", 401));
  }
  console.log(token);
  // 2) Verify the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(new AppError("The user belonging to token does no longer exist", 401));
  }
  // 4) Check if user changed the password after token issued
  if (freshUser.changePasswordAfter(decoded.iat)) {
    return next(new AppError("password was recently changed. please! login again", 401));
  }
  req.user = freshUser;
  next();
});

exports.protectedRoute = (req, res, next) => {
  console.log("Hello i am protected route");
};
