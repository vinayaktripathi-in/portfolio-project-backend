require("dotenv").config();
const express = require("express");
const cors = require('cors');
const app = express();

// Allow requests from your frontend domain
app.use(cors({
  origin: 'http://localhost:3000', // Adjust to your frontend URL
  methods: 'GET, POST, PUT, DELETE', // Adjust the allowed HTTP methods
  credentials: true, // Allow sending cookies and other credentials
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import route files
const signInRoute = require("./routes/signin");
const signUpRoute = require("./routes/signup");
const forgotPasswordRoute = require("./routes/forgot-password");
const verifyRoute = require("./routes/verify");
const createPasswordRoute = require("./routes/create-password");
const contactRoute = require("./routes/contact");

// Use route handlers
app.use("/signin", signInRoute);
app.use("/signup", signUpRoute);
app.use("/forgot-password", forgotPasswordRoute);
app.use("/verify", verifyRoute);
app.use("/create-password", createPasswordRoute);
app.use("/contact", contactRoute);

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
