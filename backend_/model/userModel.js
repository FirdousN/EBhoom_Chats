const mongoose = require('mongoose')
const Schema = mongoose.Schema

const signupSchema = new Schema(
    {
      email: {
        type: String,
        required: true,
        unique: true,
      },
      username: {
        type: String,
        required: true,
      },
      password: {
        type: String,
        required: true,
        minlength: 6,
      },
      profilePic: {
        type: String,
        default: "",
      },
    },
    { timestamps: true }
  );

module.exports = mongoose.model('users',signupSchema)