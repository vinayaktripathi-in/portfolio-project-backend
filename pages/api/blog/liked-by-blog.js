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

// Middleware for JWT authentication
function authenticateJWT(req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  jwt.verify(token, "XXR", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded; // Store user information in the request object
    next();
  });
}

router.get("/:blogId", authenticateJWT, async (req, res) => {
  const { blogId } = req.params;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");
    const usersCollection = db.collection("users");

    // Find the blog post by its ID
    const blog = await blogsCollection.findOne({ blogId: blogId });

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the blog.likes array exists and is an array before proceeding
    if (!Array.isArray(blog.likes)) {
      return res.status(500).json({ message: "Invalid blog format" });
    }

    // Fetch the details of users who have liked the blog
    const userObjectIds = blog.likes.map((userId) => new ObjectId(userId));
    const likedUsers = await usersCollection
      .find({ _id: { $in: userObjectIds } })
      .toArray();

    res.status(200).json(likedUsers);
  } catch (error) {
    console.error("Error fetching liked users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
