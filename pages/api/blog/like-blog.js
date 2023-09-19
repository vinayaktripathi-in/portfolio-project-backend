const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.use(bodyParser.json());

router.post("/:blogId/like", async (req, res) => {
  const { blogId } = req.params;
  const token = req.header("x-auth-token");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

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
      const objectIdUserId = new ObjectId(userId); // Convert it to ObjectId

      const user = await usersCollection.findOne({ _id: objectIdUserId });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if the blog post exists
      const blog = await blogsCollection.findOne({ blogId: blogId });

      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
      // Check if the blog.likes array exists and is an array before using includes
      if (!Array.isArray(blog.likes)) {
        return res.status(500).json({ message: "Invalid blog format" });
      }
      // Check if the user has already liked the blog
      if (blog.likes.includes(userId)) {
        return res
          .status(400)
          .json({ message: "User already liked this blog" });
      }
      // Add the user to the list of likes
      blog.likes.push(userId);

      // Update the blog post with the new likes array
      await blogsCollection.updateOne(
        { blogId: blogId },
        { $set: { likes: blog.likes } }
      );
      res.status(200).json({ message: "Blog liked successfully" });
    });
  } catch (error) {
    console.error("Error liking the blog:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
