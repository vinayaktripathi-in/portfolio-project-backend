const express = require("express");
const passport = require("passport");
const { MongoClient } = require("mongodb");

const router = express.Router();
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

router.get(
    "/google/callback",
    passport.authenticate("google", {
      successRedirect: "/auth/success", // Redirect after successful login
      failureRedirect: "/auth/failure", // Redirect after failed login
    })
  );
  
  // Handle saving user data to the database
  router.get("/google/callback", async (req, res) => {
    // If authentication was successful, the user's profile is available as req.user
    
    if (!req.user) {
      return res.status(401).json({ message: "Google OAuth login failed" });
    }
    await client.connect();
    const db = client.db("portfolio-project"); // Replace with your actual database name
    const usersCollection = db.collection("users");
  
    // Check if the user is already in your database
    const existingUser = await usersCollection.findOne({ googleId: req.user.id });
  
    if (existingUser) {
      // User already exists in the database, handle accordingly
      // You can redirect to a profile page or do whatever you need
      res.redirect("/profile");
    } else {
      // User doesn't exist, so save their data to the database
      const newUser = {
        googleId: req.user.id,
        displayName: req.user.displayName,
        // Add other user properties you want to save
      };
  
      const result = await usersCollection.insertOne(newUser);
      if (result.insertedCount === 1) {
        // User data saved successfully
        res.redirect("/profile");
      } else {
        // Handle the case where data couldn't be saved
        res.status(500).json({ message: "Failed to save user data" });
      }
    }
  });
  