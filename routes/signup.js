const express = require("express");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");

const router = express.Router();

const uri = process.env.MONGODB_URI; // Replace with your actual local database name
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.post("/", async (req, res) => {
  const { email, password, phone } = req.body;

  try {
    await client.connect();
    const db = client.db(); // No need to provide database name here
    const usersCollection = db.collection("users");

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user document
    const result = await usersCollection.insertOne({
      email: email,
      password: hashedPassword,
      phone: phone,
    });

    console.log("User inserted:", result.insertedId);
    res.json({ message: "User registered successfully" });

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
