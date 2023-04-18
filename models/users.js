const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  fname: {
    type: String,
    required: true,
  },
  lname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  tokens: {
    accessToken: {
      token: String,
      expireAt: Date,
    },
    refreshToken: {
      token: String,
      expireAt: Date,
    },
  },
});

const userSchema = mongoose.model("User", schema);
module.exports = userSchema;
