const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.use(bodyParser.json());

router.get("/:blogId", async (req, res) => {
  // const token = req.header("x-auth-token");

  // if (!token) {
  //   return res
  //     .status(401)
  //     .json({ message: "Access denied. No token provided." });
  // }
  
  // const { blogId } = req.params;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");

    // Find the blog by its ID
    const blog = await blogsCollection.findOne({ blogId: blogId });

    if (!blog) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    res.status(200).json(blog);

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
