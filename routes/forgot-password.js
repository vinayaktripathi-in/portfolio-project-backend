const express = require("express");
const { MongoClient } = require("mongodb");
const speakeasy = require("speakeasy");
const nodemailer = require("nodemailer");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Setup your Nodemailer transporter here
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

transporter
  .verify()
  .then(() => console.log("Connected to email server"))
  .catch((error) => console.log("Unable to connect to email server."));

router.post("/", async (req, res) => {
  const { email } = req.body;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate a temporary secret for OTP generation
    const tempSecret = speakeasy.generateSecret();

    // Generate OTP
    const otp = speakeasy.totp({
      secret: tempSecret.base32, // Use base32 secret for OTP generation
      encoding: "base32",
    });

    // Save the temporary secret in the user's document
    await usersCollection.updateOne(
      { email },
      { $set: { otpSecret: tempSecret.base32 } }
    );

    // Send OTP to user's email
    const mailOptions = {
      from: "admin@vinayaktripathi.in",
      to: email,
      subject: "OTP for Password Reset",
      text: `Your OTP for password reset is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        res.status(500).json({
          message: "Error sending OTP email",
          otp: otp,
        });
      } else {
        console.log("Email sent:", info.response);
        res.json({ message: "OTP sent to your email", otp: otp });
      }
    });

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
