const express = require("express");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const jwt = require("jsonwebtoken");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const bodyParser = require("body-parser");
const multer = require("multer");

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

router.put("/", upload.single("profilePic"), async (req, res) => {
  const token = req.header("x-auth-token");
  const {
    firstName,
    lastName,
    fullName,
    email,
    password,
    phone,
    isEmailVerified,
    isPhoneVerified,
    username,
    profileURL,
    profileBio,
    followersCount,
    followingCount,
    postsCount,
    blogsCount,
    platform,
    lastUpdateTimestamp,
    isVerified,
  } = req.body;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const usersCollection = db.collection("users");

    // Verify the JWT token
    jwt.verify(token, "XXR", async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      const userId = decoded.userId; // userId is a string
      console.log(userId);

      // Check if a profile pic was provided in the request
      let profilePic = null;
      if (req.file) {
        // Convert the image data to a base64-encoded string
        const imageBuffer = req.file.buffer.toString("base64");

        // Upload the image to Cloudinary using the base64-encoded string
        try {
          const cloudinaryResponse = await cloudinary.uploader.upload(
            `data:image/jpeg;base64,${imageBuffer}`,
            {
              folder: "profile-picture",
            }
          );

          // Check if the upload to Cloudinary was successful
          if (!cloudinaryResponse || cloudinaryResponse.error) {
            client.close(); // Close the MongoDB connection in case of an error
            return res
              .status(500)
              .json({ message: "Error uploading image to Cloudinary" });
          }

          // Extract the public URL of the uploaded image
          profilePic = cloudinaryResponse.secure_url;
        } catch (cloudinaryError) {
          client.close(); // Close the MongoDB connection in case of an error
          console.error(
            "Error uploading image to Cloudinary:",
            cloudinaryError
          );
          return res
            .status(500)
            .json({ message: "Error uploading image to Cloudinary" });
        }
      }

      // Initialize updateFields with the fields you want to update
      const updateFields = {
        firstName,
        lastName,
        fullName,
        email,
        phone,
        isEmailVerified,
        isPhoneVerified,
        username,
        profilePic,
        profileURL,
        profileBio,
        followersCount,
        followingCount,
        postsCount,
        blogsCount,
        platform,
        lastUpdateTimestamp,
        isVerified,
      };

      // Iterate through the allowed fields and update them if present in req.body
      const allowedFields = [
        "firstName",
        "lastName",
        "fullName",
        "email",
        "phone",
        "isEmailVerified",
        "isPhoneVerified",
        "username",
        "profilePic",
        "profileURL",
        "profileBio",
        "followersCount",
        "followingCount",
        "postsCount",
        "blogsCount",
        "platform",
        "lastUpdateTimestamp",
        "isVerified",
      ];

      allowedFields.forEach((field) => {
        if (field in req.body) {
          updateFields[field] = req.body[field];
        }
      });

      // Hash the password if it's provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateFields.password = hashedPassword;
      }

      const result = await usersCollection.updateOne(
        { userId: userId }, // To find the user
        { $set: updateFields }
      );
      
      const user = await usersCollection.findOne({ userId: userId });
      const userData = {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        token: user.token,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        username: user.username,
        profilePic: user.profilePic,
        profileURL: user.profileURL,
        profileBio: user.profileBio,
        followersCount: user.followersCount,
        followingCount: user.followingCount,
        postsCount: user.postsCount,
        blogsCount: user.blogsCount,
        platform: user.platform,
        lastUpdateTimestamp: user.lastUpdateTimestamp,
        isVerified: user.isVerified,
      };

      if (result.modifiedCount === 1) {
        res
          .status(200)
          .json({ message: "User profile updated successfully", userData });
      } else {
        res.status(500).json({ message: "Failed to update user profile" });
      }
      client.close(); // Ensure the MongoDB connection is closed after the operation
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
