const express = require("express");
const { MongoClient, ObjectId  } = require("mongodb");
const bodyParser = require("body-parser");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.use(bodyParser.json());

router.delete("/:blogId", async (req, res) => {
  const { blogId } = req.params;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");
    
    const objectId = new ObjectId(blogId);

    // Delete the blog by its ID
    const result = await blogsCollection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    res.status(200).json({ message: "Blog deleted successfully" });

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;