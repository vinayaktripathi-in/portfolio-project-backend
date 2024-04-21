const express = require("express");
const { MongoClient } = require("mongodb");
// const jwt = require("jsonwebtoken");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.get("/:blogId", async (req, res) => {
  const { blogId } = req.params;
  // const token = req.header("x-auth-token");

  // if (!token) {
  //   return res
  //     .status(401)
  //     .json({ message: "Access denied. No token provided." });
  // }
  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");

    // jwt.verify(token, "XXR", async (err, decoded) => {
    //   if (err) {
    //     return res.status(401).json({ message: "Invalid token" });
    //   }
    // });
    // Find the blog post by its ID
    const blog = await blogsCollection.findOne({ blogId: blogId });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    // Retrieve all comments for the blog post
    const comments = blog.comments;

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
