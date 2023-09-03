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
// POST API
const signInRoute = require("./routes/signin");
const signUpRoute = require("./routes/signup");
const verifyRoute = require("./routes/verify");
const contactRoute = require("./routes/contact");
const forgotPasswordRoute = require("./routes/forgot-password");
const createPasswordRoute = require("./routes/create-password");

// GET API
const userDataRoute = require("./routes/user-data");

// Use route handlers
// POST API
app.use("/signin", signInRoute);
app.use("/signup", signUpRoute);
app.use("/verify", verifyRoute);
app.use("/contact", contactRoute);
app.use("/forgot-password", forgotPasswordRoute);
app.use("/create-password", createPasswordRoute);

// GET API
app.use("/user-data", userDataRoute);

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
