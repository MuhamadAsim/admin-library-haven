
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Member = require('../models/Member');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'librarysecretsecret123',
    { expiresIn: '7d' }
  );
};

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }
    
    // Create and return JWT token
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    // Token verification middleware would attach user to req
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth/register
// @desc    Register a new member user
// @access  Private/Admin
router.post('/register', async (req, res) => {
  const { email, password, memberId } = req.body;

  try {
    // Verify member exists
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ msg: 'Member not found' });
    }

    // Check if user with email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password, // Will be hashed by the pre-save hook
      role: 'member',
      memberId
    });

    await user.save();

    res.json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Seed the default admin account
const seedDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@gmail.com' });
    
    if (!adminExists) {
      console.log('Creating default admin account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new User({
        email: 'admin@gmail.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      await admin.save();
      console.log('Default admin account created successfully');
    }
  } catch (error) {
    console.error('Error seeding default admin:', error);
  }
};

// Call this function when the server starts
seedDefaultAdmin();

module.exports = router;
