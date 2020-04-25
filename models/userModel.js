const mongoose = require("mongoose");
var validator = require("validator");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, "name is required"],
  },
  username: {
    type: String,
    unique: true,
    maxlength: 16,
    required: [true, "username is required"],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: [true, "email is required"],
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  password: {
    type: String,
    minlength: 8,
    required: [true, "password is required"],
    select: false,
    maxlength: 128,
  },
  passwordConfirm: {
    type: String,
    required: [true, "confirm password field is required"],
    // This only work on SAVE and CREATE not on UPDATED
    validate: {
      validator: function (el) {
        return el == this.password;
      },
      message: "passwords are not same",
    },
  },
  passwordChangedAt: Date,
  photo: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  console.log(this.isModified("password"));
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  console.log(this.password);

  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userpassword) {
  return await bcrypt.compare(candidatePassword, userpassword);
};

userSchema.methods.changePasswordAfter = function (JWTtimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTtimeStamp < changedTimeStamp;
    console.log(passwordChangedAt, JWTtimeStamp);
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
