const express = require("express");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const multer = require("multer");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Configure multer to store uploaded files in a specific directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Create an 'uploads' directory in your project
  },
  filename: function (req, file, cb) {
    const extension = file.originalname.split(".").pop();
    const filename = `${uuidv4()}.${extension}`;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.use(bodyParser.json());

// Use the 'upload' middleware to handle file uploads
router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, content, email } = req.body; // userEmail is used to identify the user
  const coverImage = req.file ? req.file.filename : null; // Get the uploaded file's filename

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");
    const usersCollection = db.collection("users");

    // Find the user based on their email
    const user = await usersCollection.findOne({ email: email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate a unique blog ID
    const blogId = uuidv4();

    // Insert the blog document with the generated blog ID, user's name as author, and cover image filename
    const result = await blogsCollection.insertOne({
      blogId: blogId,
      title: title,
      content: content,
      author: `${user.firstName} ${user.lastName}`,
      email: `${user.email}`,
      coverImage: coverImage, // Store the cover image filename
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
