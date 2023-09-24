const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken"); // Import jwt library

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.use(bodyParser.json());

// Get all blogs
router.get("/", async (req, res) => {
  const token = req.header("x-auth-token"); // Get the token from the request header

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
      // const objectIdUserId = new ObjectId(userId); // Convert it to ObjectId

      const user = await usersCollection.findOne({ _id: userId });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const blogs = await blogsCollection.find().toArray(); // Find all blogs in the collection
      res.status(200).json(blogs);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
