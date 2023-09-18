const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const fs = require("fs");

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

router.post("/", async (req, res) => {
  const token = req.header("x-auth-token");
  const { title, content, category, coverImage } = req.body;

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
      const objectIdUserId = new ObjectId(userId);

      const user = await usersCollection.findOne({ _id: objectIdUserId });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      console.log(title);
      // Upload the image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(
        "https://res.cloudinary.com/demo/sample.jpg",
        {
          folder: "blog-covers", // Optional: You can organize uploaded images into folders
        }
      );
      // Check if the upload to Cloudinary was successful
      if (!cloudinaryResponse || cloudinaryResponse.error) {
        return res
          .status(500)
          .json({ message: "Error uploading image to Cloudinary" });
      }

      // Extract the public URL of the uploaded image
      const imageUrl = cloudinaryResponse.secure_url;

      // Generate a unique blog ID
      const blogId = uuidv4();

      // Insert the blog document with the generated blog ID, user's name as author, and cover image URL
      const result = await blogsCollection.insertOne({
        blogId: blogId,
        title: title,
        content: content,
        category: category,
        author: `${user.firstName} ${user.lastName}`,
        email: `${user.email}`,
        coverImage: imageUrl, // Store the Cloudinary image URL
        createdAt: new Date(),
      });

      console.log("Blog inserted:", result.insertedId);

      // Clean up (delete) the temporary image file (if it was saved locally)
      if (req.body.coverImage && req.body.coverImage.startsWith("uploads/")) {
        fs.unlinkSync(req.body.coverImage);
      }

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
