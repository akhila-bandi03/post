const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper — generate JWT token
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email.' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }

    // Hash password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to `users` collection
    await User.create({
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    return res.status(201).json({ message: 'Account created successfully! Please log in.' });
  } catch (error) {
    console.error('Signup error:', error.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare password using bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate JWT and return user info
    const token = generateToken(user._id);
    return res.status(200).json({
      message: 'Login successful!',
      token,
      user: { id: user._id, _id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

module.exports = { signup, login };
