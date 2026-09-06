const Post = require('../models/Post');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// ─── Configure Cloudinary ───────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ─── Memory Storage with Resilient Cloudinary Pipeline ──────────────────────
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ─── Helper: Upload Buffer to Cloudinary ────────────────────────────────────
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'feedconnect',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// ─── GET /api/posts?page=1&limit=10 ─────────────────────────────────────────
const getPosts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const totalPosts = await Post.countDocuments();
    // Newest posts first
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.json({
      posts,
      pagination: {
        totalPosts,
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit) || 1,
        hasNextPage: skip + posts.length < totalPosts
      }
    });
  } catch (error) {
    console.error('Get posts error:', error.message);
    return res.status(500).json({ message: 'Failed to fetch posts.' });
  }
};

// ─── POST /api/posts ─────────────────────────────────────────────────────────
// Accepts text content and/or image upload via multipart/form-data or JSON body
const createPost = async (req, res) => {
  try {
    const content = req.body.content ? req.body.content.trim() : '';
    let image = req.body.image ? req.body.image.trim() : '';

    // If a file was uploaded, attempt Cloudinary upload with resilient fallback
    if (req.file) {
      const hasCloudinaryKeys =
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET;

      if (hasCloudinaryKeys) {
        try {
          const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
          image = result.secure_url || result.url;
        } catch (cloudErr) {
          console.warn('⚠️ Cloudinary upload warning (using fallback):', cloudErr.message);
          // Fallback: save as Data URI so user post always succeeds
          const b64 = req.file.buffer.toString('base64');
          image = `data:${req.file.mimetype};base64,${b64}`;
        }
      } else {
        const b64 = req.file.buffer.toString('base64');
        image = `data:${req.file.mimetype};base64,${b64}`;
      }
    }

    // At least one of content or image must be provided
    if (!content && !image) {
      return res.status(400).json({ message: 'Please add text or an image to your post.' });
    }

    const post = await Post.create({
      user: { userId: req.user._id, username: req.user.username },
      content,
      image,
      likes: [],
      comments: []
    });

    return res.status(201).json({ message: 'Post created!', post });
  } catch (error) {
    console.error('Create post error:', error.message);
    return res.status(500).json({ message: 'Failed to create post.' });
  }
};

// ─── POST /api/posts/:id/like ─────────────────────────────────────────────────
// Toggle like / unlike — one user can like only once
const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    const alreadyLiked = post.likes.some(
      (like) => like.userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
      // Unlike — remove user's entry from likes array
      post.likes = post.likes.filter(
        (like) => like.userId.toString() !== req.user._id.toString()
      );
    } else {
      // Like — push userId and username
      post.likes.push({ userId: req.user._id, username: req.user.username });
    }

    await post.save();
    return res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (error) {
    console.error('Like error:', error.message);
    return res.status(500).json({ message: 'Failed to toggle like.' });
  }
};

// ─── POST /api/posts/:id/comment ──────────────────────────────────────────────
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });

    // Push comment with userId, username, text, createdAt
    post.comments.push({
      userId: req.user._id,
      username: req.user.username,
      text: text.trim(),
      createdAt: new Date()
    });

    await post.save();
    return res.status(201).json({ comments: post.comments });
  } catch (error) {
    console.error('Comment error:', error.message);
    return res.status(500).json({ message: 'Failed to add comment.' });
  }
};

module.exports = { getPosts, createPost, toggleLike, addComment, upload };
