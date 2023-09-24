const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const router = express.Router();
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.get("/", async (req, res) => {
  const token = req.header("x-auth-token"); // Get the token from the request header

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

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
      const objectIdUserId = new ObjectId(userId); // Convert it to ObjectId

      const user = await usersCollection.findOne({ _id: objectIdUserId });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Return the user data
      const userData = {
        userId: user._id,
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
      res.json(userData);
      client.close();
    });
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router; // Export the router instance
