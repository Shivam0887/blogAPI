const express = require("express");
const router = express.Router();
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  getRecentBlogs,
} = require("../controllers/blogController.js");

//Public routes
router.get("/", getBlogs);
router.get("/recent-blogs", getRecentBlogs);
router.get("/:id", getBlog);

//Protected routes
router.post("/new-blog", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);

module.exports = router;
