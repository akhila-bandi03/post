const mongoose = require('mongoose');

// Collection: posts — exactly as specified in the requirements
const postSchema = new mongoose.Schema({
  // Author info embedded (no join needed)
  user: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true }
  },
  // Post content — at least one of content or image must be present (validated in controller)
  content: {
    type: String,
    default: ''
  },
  // Cloudinary image URL — stored as string
  image: {
    type: String,
    default: ''
  },
  // Likes — array of { userId, username } — no separate collection
  likes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: { type: String }
    }
  ],
  // Comments — embedded array — no separate collection
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      username: { type: String },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);
