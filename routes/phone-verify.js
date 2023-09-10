const express = require("express");
const { MongoClient } = require("mongodb");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.post("/", async (req, res) => {
  const { phoneVerificationCode } = req.body;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const usersCollection = db.collection("users");

    // Find the user with the matching phone verification code
    const user = await usersCollection.findOne({ phoneVerificationCode });

    if (!user) {
      res.status(404).json({ message: "Invalid verification code" });
      return;
    }

    // Update the user's "isPhoneVerified" field to true
    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { isPhoneVerified: true } }
    );

    res.status(200).json({ message: "Phone number verified successfully" });
  } catch (error) {
    console.error("Error verifying phone number:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
