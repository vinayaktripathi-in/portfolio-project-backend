const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.use(bodyParser.json());

router.put("/blogs/:blogId", async (req, res) => {
  const { blogId } = req.params;
  const { title, content } = req.body;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");

    // Update the blog by its ID
    const result = await blogsCollection.updateOne(
      { _id: ObjectId(blogId) },
      { $set: { title: title, content: content } }
    );

    if (result.modifiedCount === 0) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    res.status(200).json({ message: "Blog updated successfully" });

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;