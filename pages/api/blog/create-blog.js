const express = require("express");
const { MongoClient, ObjectId } = require("mongodb"); // Import ObjectId from mongodb
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const multer = require("multer");
const jwt = require("jsonwebtoken"); // Import jwt module

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
  const token = req.header("x-auth-token");
  const { title, content } = req.body;
  const coverImage = req.file ? req.file.filename : null;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const blogsCollection = db.collection("blogs");
    const usersCollection = db.collection("users");

    // Verify the JWT token
    jwt.verify(token, "XXR", async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const userId = decoded.userId; // userId is a string
      const objectIdUserId = new ObjectId(userId);

      const user = await usersCollection.findOne({ _id: objectIdUserId });

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
    });
  }  catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
