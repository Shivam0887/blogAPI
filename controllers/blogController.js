const User = require("../models/users.js");
const Blog = require("../models/blogs.js");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//GET request -> Get all the available blogs
const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({}, { createdAt: 0, updatedAt: 0, __v: 0 });

    res.status(200).send(blogs);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};

//GET request -> Get a single blog based on a blog-id
const getBlog = async (req, res) => {
  try {
    const postId = req.params.id;
    const blog = await Blog.findById({ _id: postId }, { __v: 0 });

    const { uid } = blog;
    const { fname, lname } = await User.findById({ _id: uid });

    const info = {
      blog,
      fname,
      lname,
      postId,
      uid: uid
    };
    res.status(200).json(info);
  } catch (error) {
    console.log(error);
  }
};

//POST request -> Create a new blog post
const createBlog = async (req, res) => {
  try {
    
    if (!req?.body?.createBlog?.user) {
      res.status(400).json({ status: false, message: "Please login first" });
      return;
    }

    const { title, category, difficulty, blogBody, user } = req.body.createBlog;
    const { _id } = user;
    const newBlog = new Blog({
      uid: _id,
      title,
      category,
      difficulty,
      blogBody,
    });
    await newBlog.save();
    res.status(201).json({ status: true, message: "Post created" });
  } catch (err) {
    res.status(400).json({ status: false, message: "Post is empty" });
  }
};

//PUT request -> update existing blog post
const updateBlog = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ status: false, message: "Unauthorized user" });
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, userId) => {
    try {
      if (err)
        return res.status(401).json({ status: false, message: "Unauthorized user" });
      const postId = req.params.id;
      const { uid } = await Blog.findById({ _id: postId });

      if (userId._id !== uid.toString())
        return res
          .status(403)
          .json({ status: false, message: "Invalid token" });

      const {title, category, difficulty, blogBody} = req.body.updatedBlog;

      await Blog.findByIdAndUpdate({ _id: postId }, {$set: {title : title, category: category, difficulty: difficulty, blogBody: blogBody, updatedAt: Date.now()}}, 
      {runValidators: true, new: true});
      res
        .status(200)
        .json({ status: true, message: "Post updated sucessfully" });
    }
    catch(error){
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  })
};

//DELETE request -> delete existing blog post
const deleteBlog = (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res
      .status(401)
      .json({ status: false, message: "Unauthorized user" });
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, async (err, userId) => {
    try {
      if (err)
        return res
          .status(401)
          .json({ status: false, message: "Unauthorized user" });

      const postId = req.params.id;
      const { uid } = await Blog.findById({ _id: postId });

      if (userId._id !== uid.toString())
        return res
          .status(403)
          .json({ status: false, message: "Invalid token" });

      await Blog.findByIdAndDelete({ _id: postId }, { new: true });
      res
        .status(200)
        .json({ status: true, message: "Post deleted sucessfully" });
    } catch (error) {
      res.status(500).json({ status: false, message: "Internal server error" });
    }
  });
};

//GET request -> Get recent blog post
const getRecentBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find(
      {},
      { title: 1, category: 1, blogBody: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1 })
      .limit(2);
    res.status(200).send(blogs);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getRecentBlogs,
};
