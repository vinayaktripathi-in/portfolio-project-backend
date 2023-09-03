const express = require("express");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const { v4: uuidv4 } = require("uuid"); // For generating UUIDs

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
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
    res.status(200).json({ message: "User registered successfully", userId: userId });

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;