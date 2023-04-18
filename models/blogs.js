const mongoose = require("mongoose");
const User = require("../models/users.js");

const schema = new mongoose.Schema({
  uid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  category: String,
  difficulty: String,
  blogBody: String,
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  updatedAt: Date
});

const blogSchema = new mongoose.model("Blog", schema);
module.exports = blogSchema;
