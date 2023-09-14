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
      "https://www.vinayaktripathi.in"
    ],
    methods: "GET, POST, PUT, DELETE", // Adjust the allowed HTTP methods
    credentials: true, // Allow sending cookies and other credentials
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import route files
// POST Auth API
const signInRoute = require("./pages/api/auth/signin");
const signUpRoute = require("./pages/api/auth/signup");
const contactRoute = require("./pages/api/contact");
const OTPVerifyRoute = require("./pages/api/auth/otp-verify");
const emailVerifyRoute = require("./pages/api/auth/email-verify");
const phoneVerifyRoute = require("./pages/api/auth/phone-verify");
const forgotPasswordRoute = require("./pages/api/auth/forgot-password");
const createPasswordRoute = require("./pages/api/auth/create-password");

// Blog API's
const createBlogRoute = require("./pages/api/blog/create-blog");
const getAllBlogRoute = require("./pages/api/blog/get-all-blogs");
const getBlogRoute = require("./pages/api/blog/get-blog");
const deleteBlogRoute = require("./pages/api/blog/delete-blog");
const updateBlogRoute = require("./pages/api/blog/update-blog");
app.use("/create-blog", createBlogRoute);
app.use("/get-all-blogs", getAllBlogRoute);
app.use("/get-blog", getBlogRoute);
app.use("/delete-blog", deleteBlogRoute);
app.use("/update-blog", updateBlogRoute);

// GET API
const userDataRoute = require("./pages/api/auth/user-data");

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
