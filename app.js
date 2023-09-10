require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// Allow requests from your frontend domain
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://portfolio-project-frontend-vinayaktripathi.vercel.app",
    ],
    methods: "GET, POST, PUT, DELETE", // Adjust the allowed HTTP methods
    credentials: true, // Allow sending cookies and other credentials
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import route files
// POST API
const signInRoute = require("./routes/signin");
const signUpRoute = require("./routes/signup");
const contactRoute = require("./routes/contact");
const OTPVerifyRoute = require("./routes/otp-verify");
const emailVerifyRoute = require("./routes/email-verify");
const phoneVerifyRoute = require("./routes/phone-verify");
const forgotPasswordRoute = require("./routes/forgot-password");
const createPasswordRoute = require("./routes/create-password");

// GET API
const userDataRoute = require("./routes/user-data");

// Use route handlers
// POST API
app.use("/signin", signInRoute);
app.use("/signup", signUpRoute);
app.use("/contact", contactRoute);
app.use("/otp-verify", OTPVerifyRoute);
app.use("/email-verify", emailVerifyRoute);
app.use("/phone-verify", phoneVerifyRoute);
app.use("/forgot-password", forgotPasswordRoute);
app.use("/create-password", createPasswordRoute);

// GET API
app.use("/user-data", userDataRoute);

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
