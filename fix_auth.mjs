import { writeFileSync } from 'fs';

// ══ middleware/authMiddleware.js — fixed ══
writeFileSync('middleware/authMiddleware.js', `const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token invalid or expired',
    });
  }
};

module.exports = { protect };
`);

// ══ controllers/authController.js — fixed ══
writeFileSync('controllers/authController.js', `const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required',
      });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };
`);

// ══ routes/authRoutes.js — fixed ══
writeFileSync('routes/authRoutes.js', `const express  = require('express');
const router   = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);

module.exports = router;
`);

// ══ routes/projectRoutes.js ══
writeFileSync('routes/projectRoutes.js', `const express = require('express');
const router  = express.Router();
const {
  getProjects, createProject, updateProject, deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',        getProjects);
router.post('/',       protect, createProject);
router.put('/:id',    protect, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
`);

// ══ routes/blogRoutes.js ══
writeFileSync('routes/blogRoutes.js', `const express = require('express');
const router  = express.Router();
const {
  getBlogs, getAllBlogs, createBlog, updateBlog, deleteBlog,
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',        getBlogs);
router.get('/all',     protect, getAllBlogs);
router.post('/',       protect, createBlog);
router.put('/:id',    protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

module.exports = router;
`);

// ══ routes/messageRoutes.js ══
writeFileSync('routes/messageRoutes.js', `const express = require('express');
const router  = express.Router();
const {
  sendMessage, getMessages, markRead, deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',           sendMessage);
router.get('/',            protect, getMessages);
router.put('/:id/read',   protect, markRead);
router.delete('/:id',     protect, deleteMessage);

module.exports = router;
`);

// ══ routes/testimonialRoutes.js ══
writeFileSync('routes/testimonialRoutes.js', `const express = require('express');
const router  = express.Router();
const {
  getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
} = require('../controllers/testimonialController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',        getTestimonials);
router.post('/',       protect, createTestimonial);
router.put('/:id',    protect, updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);

module.exports = router;
`);

// ══ routes/analyticsRoutes.js ══
writeFileSync('routes/analyticsRoutes.js', `const express = require('express');
const router  = express.Router();
const { getStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStats);

module.exports = router;
`);

// ══ routes/skillRoutes.js ══
writeFileSync('routes/skillRoutes.js', `const express = require('express');
const router  = express.Router();
const {
  getSkills, createSkill, updateSkill, deleteSkill,
} = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',        getSkills);
router.post('/',       protect, createSkill);
router.put('/:id',    protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

module.exports = router;
`);

// ══ routes/profileRoutes.js ══
writeFileSync('routes/profileRoutes.js', `const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',  getProfile);
router.put('/', protect, updateProfile);

module.exports = router;
`);

console.log(`
╔═══════════════════════════════════════════════════╗
║  Fix complete!                                    ║
╠═══════════════════════════════════════════════════╣
║                                                   ║
║  সমস্যা ছিল:                                     ║
║  middleware exports.protect → module.exports ছিল  ║
║  না, তাই next function হিসেবে পাচ্ছিল না।       ║
║                                                   ║
║  এখন করুন:                                       ║
║  1. node server.js  (restart)                    ║
║  2. register curl আবার চালান                     ║
╚═══════════════════════════════════════════════════╝
`);
