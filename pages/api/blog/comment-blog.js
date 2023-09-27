const express = require("express");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.use(bodyParser.json());

router.post("/:blogId", async (req, res) => {
  const token = req.header("x-auth-token"); // Get the token from the request header

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const { blogId } = req.params;
  const { text, taggedUsers, likedUsers } = req.body; // Assuming you send comment text and tagged user in the request body

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");
    const usersCollection = db.collection("users");

    jwt.verify(token, "XXR", async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const userId = decoded.userId; // userId is a string
      // Find the blog post by its ID
      const blog = await blogsCollection.findOne({ blogId: blogId });

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }

      const user = await usersCollection.findOne({ userId: userId });

      // Create a new comment object
      const comment = {
        text,
        taggedUsers, // You can modify this to store user information like username or user ID
        likedUsers, // You can modify this to store user information likes
        userId: userId, // Store the user ID who posted the comment
        username: `${user.username}`,
        profilePic: `${user.profilePic}`,
        author: `${user.firstName} ${user.lastName}`,
        createdAt: new Date(),
      };

      // Add the comment to the blog's comments array
      blog.comments.push(comment);

      // Update the blog post with the new comment
      await blogsCollection.updateOne({ blogId: blogId }, { $set: blog });
    });

    res.status(201).json({ message: "Comment posted successfully" });
  } catch (error) {
    console.error("Error posting comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
