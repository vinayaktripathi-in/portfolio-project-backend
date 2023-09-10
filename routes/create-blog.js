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

router.post("/blogs", async (req, res) => {
  const { title, content, userEmail } = req.body; // userEmail is used to identify the user

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");
    const usersCollection = db.collection("users");

    // Find the user based on their email
    const user = await usersCollection.findOne({ email: userEmail });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate a unique blog ID
    const blogId = uuidv4();

    // Insert the blog document with the generated blog ID and user's name as author
    const result = await blogsCollection.insertOne({
      blogId: blogId,
      title: title,
      content: content,
      author: `${user.firstName} ${user.lastName}`,
      createdAt: new Date(),
    });

    console.log("Blog inserted:", result.insertedId);
    res.status(200).json({
      message: "Blog posted successfully",
      blogId: blogId,
    });

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;