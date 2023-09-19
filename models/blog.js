const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: { type: Number, default: 0 },
  comments: [{ text: String, user: String, createdAt: Date }],
  shares: { type: Number, default: 0 },
});

// Create and export the Blog model
module.exports = mongoose.model("Blog", blogSchema);
