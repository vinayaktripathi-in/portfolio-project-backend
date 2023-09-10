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

// ... (previously defined routes)

// Get all blogs
router.get("/", async (req, res) => {
  const { email } = req.body;
  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    // Find all blogs in the collection
    const blogs = await blogsCollection.find().toArray();

    res.status(200).json(blogs);

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
