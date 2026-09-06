const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  upload
} = require('../controllers/postController');

// Public — anyone can view the feed
router.get('/', getPosts);

// Protected — must be logged in
// upload.single('image') handles optional image file via Cloudinary
router.post('/',           protect, upload.single('image'), createPost);
router.post('/:id/like',   protect, toggleLike);
router.post('/:id/comment',protect, addComment);

module.exports = router;
