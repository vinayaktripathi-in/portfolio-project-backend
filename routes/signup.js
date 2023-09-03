const express = require("express");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid"); // For generating UUIDs
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
  debug: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

router.post("/", async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    await client.connect();
    const db = client.db("portfolio-project");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (user) {
      res.status(409).json({ message: "User is already registered" });
      return;
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = uuidv4(); // Generate a unique user ID

    // Insert the user document with the generated user ID
    const result = await usersCollection.insertOne({
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: hashedPassword,
      phone: phone,
    });

    console.log("User inserted:", result.insertedId);
    res.status(200).json({
      message: "User registered successfully",
      userId: userId,
      // firstName: firstName,
      // lastName: lastName,
    });

    // Variables for email template
    // const { firstName, email } = req.body;
    // const output = welcomeEmail(firstName, email);

    // Send mail to user's email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Account created successfully",
      text: `Hey, ${firstName} your account has been created successfully!`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
        res.status(500).json({
          message: "Error sending SignUp email",
        });
      } else {
        console.log("Email sent:", info.response);
        res.json({ message: "Account created successfully" });
      }
    });

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;