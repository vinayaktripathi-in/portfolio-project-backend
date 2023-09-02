const express = require("express");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const router = express.Router(); // Create an instance of Express Router

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.post("/", async (req, res) => {
  // Use 'router' here instead of 'app'
  const { email, password } = req.body;

  try {
    await client.connect();
    const db = client.db("portfolio-project"); // Replace with your actual database name
    const usersCollection = db.collection("users");
    // Connecting to MongoDB Atlas

    const user = await usersCollection.findOne({ email });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    // Sign a JWT with a secret key
    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    // Including user information in response
    const userData = {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
    };

    res.json({ message: "Sign-in successful", token, user: userData });

    client.close();
  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router; // Export the router instance
