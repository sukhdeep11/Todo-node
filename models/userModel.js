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
  photo: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
