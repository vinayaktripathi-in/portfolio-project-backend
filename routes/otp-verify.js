const express = require("express");
const { MongoClient } = require("mongodb");
const speakeasy = require("speakeasy");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.post("/", async (req, res) => {
  const { email, otp } = req.body;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.otpSecret) {
        res.status(400).json({ message: "OTP not requested" });
        return;
      }

    // Verify OTP
    const verified = speakeasy.totp.verify({
      secret: user.otpSecret, // Use the stored secret for verification
      encoding: "base32",
      token: otp,
      window: 240
    });

    if (!verified) {
      res.status(401).json({ message: "Invalid OTP" });
      return;
    }

    // Clear the temporary secret after successful verification
    await usersCollection.updateOne({ email }, { $unset: { otpSecret: "" } });

    res.json({ message: "OTP verified successfully" });

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
