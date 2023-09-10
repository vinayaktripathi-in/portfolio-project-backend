const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.post("/", async (req, res) => {
  const { emailVerificationToken } = req.body;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const usersCollection = db.collection("users");

    // Find the user with the matching email verification token
    const user = await usersCollection.findOne({ emailVerificationToken });

    if (!user) {
      res.status(404).json({ message: "Invalid verification token" });
      return;
    }

    // Update the user's "isEmailVerified" field to true
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { isEmailVerified: true } }
    );

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
