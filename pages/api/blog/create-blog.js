const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const multer = require("multer");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: "dkfmopa7c",
  api_key: "537644632849499",
  api_secret: "UmtcZrrKBaKgHwk6R7wYsjwVExw",
});

router.use(bodyParser.json());

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store the file as a buffer in memory
const upload = multer({ storage: storage });

router.post("/", upload.single("coverImage"), async (req, res) => {
  const token = req.header("x-auth-token");
  const { title, content, category } = req.body;

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

      const userId = decoded.userId;
      // const objectIdUserId = new ObjectId(userId);

      const user = await usersCollection.findOne({ userId: userId });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Check if an image was provided in the request
      let imageUrl = null;
      if (req.file) {
        // Convert the image data to a base64-encoded string
        const imageBuffer = req.file.buffer.toString("base64");

        // Upload the image to Cloudinary using the base64-encoded string
        const cloudinaryResponse = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${imageBuffer}`,
          {
            folder: "blog-covers",
          }
        );

        // Check if the upload to Cloudinary was successful
        if (!cloudinaryResponse || cloudinaryResponse.error) {
          return res
            .status(500)
            .json({ message: "Error uploading image to Cloudinary" });
        }

        // Extract the public URL of the uploaded image
        imageUrl = cloudinaryResponse.secure_url;
      }

      // Generate a unique blog ID
      const blogId = uuidv4();

      // Insert the blog document with the generated blog ID, user's name as author, and cover image URL (if provided)
      const result = await blogsCollection.insertOne({
        blogId: blogId,
        title: title,
        content: content,
        category: category,
        author: `${user.firstName} ${user.lastName}`,
        email: `${user.email}`,
        coverImage: imageUrl, // Store the Cloudinary image URL (null if no image provided)
        createdAt: new Date(),
        likes: [],
        comments: [],
        shares: [],
      });

      console.log("Blog inserted:", result.insertedId);

      res.status(200).json({
        message: "Blog posted successfully",
        blogId: blogId,
      });
    });
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    res.status(500).json({ message: "Error uploading to Cloudinary" });
    console.error("Error connecting to MongoDB Atlas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
