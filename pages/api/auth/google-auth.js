const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = (app) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID, // Your Google Client ID
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Your Google Client Secret
        callbackURL: "/auth/google/callback", // Redirect URL after Google login
      },
      (accessToken, refreshToken, profile, done) => {
        // Your strategy code here
        // This function is called after the user is authenticated by Google
        // You can customize how you handle user data
        return done(null, profile); // For simplicity, we return the user's Google profile
      }
    )
  );

  // Serialize and deserialize user for the session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  // Initialize Passport and set up session
  app.use(passport.initialize());
  app.use(passport.session());

  // Define routes

  // Route for Google OAuth login
  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"], // Define the scopes you need
    })
  );

  // Callback route for Google OAuth
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      successRedirect: "/auth/success", // Redirect after successful login
      failureRedirect: "/auth/failure", // Redirect after failed login
    })
  );

  // Routes for success and failure
  app.get("/auth/success", (req, res) => {
    res.json({ message: "Google OAuth login successful" });
  });

  app.get("/auth/failure", (req, res) => {
    res.status(401).json({ message: "Google OAuth login failed" });
  });
};
