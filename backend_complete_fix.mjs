import { writeFileSync, mkdirSync } from 'fs';

// folders ensure
['config','controllers','middleware','models','routes'].forEach(d => mkdirSync(d, { recursive: true }));

// ══════════════════════════════════════════
// server.js
// ══════════════════════════════════════════
writeFileSync('server.js', `const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174','https://tarek.dev'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI)
  .then(conn => console.log('MongoDB Connected: ' + conn.connection.host))
  .catch(err  => { console.error('DB Error: ' + err.message); process.exit(1); });

app.get('/', (req, res) => res.json({ success: true, message: 'Tarek.dev API running!' }));

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/projects',     require('./routes/projectRoutes'));
app.use('/api/blogs',        require('./routes/blogRoutes'));
app.use('/api/messages',     require('./routes/messageRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/skills',       require('./routes/skillRoutes'));
app.use('/api/profile',      require('./routes/profileRoutes'));
app.use('/api/analytics',    require('./routes/analyticsRoutes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
`);

// ══════════════════════════════════════════
// config/db.js
// ══════════════════════════════════════════
writeFileSync('config/db.js', `const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected: ' + conn.connection.host);
  } catch (error) {
    console.error('Database Connection Error: ' + error.message);
    process.exit(1);
  }
};
module.exports = connectDB;
`);

// ══════════════════════════════════════════
// config/cloudinary.js
// ══════════════════════════════════════════
writeFileSync('config/cloudinary.js', `const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key:    process.env.CLOUDINARY_API_KEY    || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});
module.exports = cloudinary;
`);

// ══════════════════════════════════════════
// middleware/authMiddleware.js
// ══════════════════════════════════════════
writeFileSync('middleware/authMiddleware.js', `const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tarek_secret_2025');
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

module.exports = { protect };
`);

// ══════════════════════════════════════════
// middleware/errorHandler.js
// ══════════════════════════════════════════
writeFileSync('middleware/errorHandler.js', `const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

const notFound = (req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found: ' + req.originalUrl });
};

module.exports = { errorHandler, notFound };
`);

// ══════════════════════════════════════════
// middleware/uploadMiddleware.js
// ══════════════════════════════════════════
writeFileSync('middleware/uploadMiddleware.js', `const multer = require('multer');
const path   = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const ext  = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowed.test(ext) && allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
module.exports = upload;
`);

// ══════════════════════════════════════════
// models/User.js
// ══════════════════════════════════════════
writeFileSync('models/User.js', `const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, default: 'admin' },
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.matchPassword = async function(entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', UserSchema);
`);

// ══════════════════════════════════════════
// models/Project.js
// ══════════════════════════════════════════
writeFileSync('models/Project.js', `const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  emoji:    { type: String, default: '🚀' },
  title:    { type: String, required: true },
  desc:     { type: String, required: true },
  tech:     [{ type: String }],
  image:    { type: String, default: '' },
  live:     { type: String, default: '' },
  github:   { type: String, default: '' },
  color:    { type: String, default: '#00D4AA' },
  cat:      { type: String, default: 'Full Stack' },
  status:   { type: String, default: 'Live' },
  featured: { type: Boolean, default: false },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
`);

// ══════════════════════════════════════════
// models/Blog.js
// ══════════════════════════════════════════
writeFileSync('models/Blog.js', `const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  emoji:     { type: String, default: '✍️' },
  title:     { type: String, required: true },
  excerpt:   { type: String, required: true },
  content:   { type: String, default: '' },
  category:  { type: String, default: 'React' },
  image:     { type: String, default: '' },
  readTime:  { type: String, default: '5' },
  color:     { type: String, default: '#38BDF8' },
  published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);
`);

// ══════════════════════════════════════════
// models/Message.js
// ══════════════════════════════════════════
writeFileSync('models/Message.js', `const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  subject: { type: String, default: '(No Subject)' },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
`);

// ══════════════════════════════════════════
// models/Testimonial.js
// ══════════════════════════════════════════
writeFileSync('models/Testimonial.js', `const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  role:   { type: String, required: true },
  text:   { type: String, required: true },
  avatar: { type: String, default: '👤' },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
`);

// ══════════════════════════════════════════
// models/Skill.js
// ══════════════════════════════════════════
writeFileSync('models/Skill.js', `const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  category: { type: String, required: true },
  icon:     { type: String, default: '⚡' },
  color:    { type: String, default: '#00D4AA' },
  items: [{
    name:    { type: String, required: true },
    percent: { type: Number, required: true, min: 0, max: 100 },
  }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
`);

// ══════════════════════════════════════════
// models/Profile.js
// ══════════════════════════════════════════
writeFileSync('models/Profile.js', `const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name:      { type: String, default: 'Tarikul Islam Tarek' },
  title:     { type: String, default: 'MERN Full Stack Developer' },
  subtitle:  { type: String, default: 'Digital Marketing Specialist' },
  bio:       { type: String, default: 'I build high-performance MERN stack web apps.' },
  bio2:      { type: String, default: 'Deployed projects on Vercel.' },
  email:     { type: String, default: 'tareq.islam.dev@gmail.com' },
  phone:     { type: String, default: '+880 1732-483149' },
  location:  { type: String, default: 'Sylhet, Bangladesh' },
  available: { type: Boolean, default: true },
  github:    { type: String, default: 'https://github.com/tarequlislam332760-collab' },
  linkedin:  { type: String, default: 'https://www.linkedin.com/in/tareq-islam3149/' },
  facebook:  { type: String, default: 'https://www.facebook.com/profile.php?id=61585040426028' },
  instagram: { type: String, default: 'https://www.instagram.com/tareq23337/' },
  whatsapp:  { type: String, default: 'https://wa.me/8801732483149' },
  cvLink:    { type: String, default: '#' },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
`);

// ══════════════════════════════════════════
// controllers/authController.js
// ══════════════════════════════════════════
writeFileSync('controllers/authController.js', `const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'tarek_secret_2025', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }
    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
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

// ══════════════════════════════════════════
// controllers/projectController.js
// ══════════════════════════════════════════
writeFileSync('controllers/projectController.js', `const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.tech === 'string') {
      body.tech = body.tech.split(',').map(t => t.trim()).filter(Boolean);
    }
    const project = await Project.create(body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.tech === 'string') {
      body.tech = body.tech.split(',').map(t => t.trim()).filter(Boolean);
    }
    const project = await Project.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted', data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
`);

// ══════════════════════════════════════════
// controllers/blogController.js
// ══════════════════════════════════════════
writeFileSync('controllers/blogController.js', `const Blog = require('../models/Blog');

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
    res.json({ success: true, message: 'Blog deleted', data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getBlogs, getAllBlogs, createBlog, updateBlog, deleteBlog };
`);

// ══════════════════════════════════════════
// controllers/messageController.js
// ══════════════════════════════════════════
writeFileSync('controllers/messageController.js', `const Message = require('../models/Message');

const sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }
    const msg = await Message.create({ name, email, subject, message });
    res.status(201).json({ success: true, message: 'Message sent successfully!', data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages   = await Message.find().sort({ createdAt: -1 });
    const unreadCount = await Message.countDocuments({ read: false });
    res.json({ success: true, count: messages.length, unreadCount, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const markRead = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    res.json({ success: true, message: 'Message deleted', data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { sendMessage, getMessages, markRead, deleteMessage };
`);

// ══════════════════════════════════════════
// controllers/testimonialController.js
// ══════════════════════════════════════════
writeFileSync('controllers/testimonialController.js', `const Testimonial = require('../models/Testimonial');

const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, data: testimonial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Testimonial not found' });
    res.json({ success: true, message: 'Testimonial deleted', data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
`);

// ══════════════════════════════════════════
// controllers/skillController.js
// ══════════════════════════════════════════
writeFileSync('controllers/skillController.js', `const Skill = require('../models/Skill');

const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1 });
    res.json({ success: true, count: skills.length, data: skills });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill deleted', data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getSkills, createSkill, updateSkill, deleteSkill };
`);

// ══════════════════════════════════════════
// controllers/profileController.js
// ══════════════════════════════════════════
writeFileSync('controllers/profileController.js', `const Profile = require('../models/Profile');

const getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(req.body);
    } else {
      profile = await Profile.findByIdAndUpdate(profile._id, req.body, { new: true, runValidators: true });
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile };
`);

// ══════════════════════════════════════════
// controllers/analyticsController.js
// ══════════════════════════════════════════
writeFileSync('controllers/analyticsController.js', `const Project     = require('../models/Project');
const Blog        = require('../models/Blog');
const Message     = require('../models/Message');
const Skill       = require('../models/Skill');
const Testimonial = require('../models/Testimonial');

const getStats = async (req, res) => {
  try {
    const [projects, blogs, skills, messages, unread, testimonials] = await Promise.all([
      Project.countDocuments(),
      Blog.countDocuments(),
      Skill.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Testimonial.countDocuments(),
    ]);

    const seoTrend = [
      { m: 'Jan', s: 45 }, { m: 'Feb', s: 52 }, { m: 'Mar', s: 48 },
      { m: 'Apr', s: 61 }, { m: 'May', s: 67 }, { m: 'Jun', s: 74 },
    ];
    const adsBreakdown = [
      { label: 'Facebook',  value: 42, color: '#3b82f6' },
      { label: 'Google',    value: 31, color: '#f59e0b' },
      { label: 'Instagram', value: 18, color: '#ec4899' },
      { label: 'Other',     value: 9,  color: '#6366f1' },
    ];

    res.json({
      success: true,
      data: {
        projects,
        blogs,
        skills,
        messages: { total: messages, unread },
        testimonials,
        seoTrend,
        adsBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats };
`);

// ══════════════════════════════════════════
// routes
// ══════════════════════════════════════════
writeFileSync('routes/authRoutes.js', `const express  = require('express');
const router   = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
router.post('/register', register);
router.post('/login',    login);
router.get('/me',        protect, getMe);
module.exports = router;
`);

writeFileSync('routes/projectRoutes.js', `const express = require('express');
const router  = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
router.get('/',        getProjects);
router.post('/',       protect, createProject);
router.put('/:id',    protect, updateProject);
router.delete('/:id', protect, deleteProject);
module.exports = router;
`);

writeFileSync('routes/blogRoutes.js', `const express = require('express');
const router  = express.Router();
const { getBlogs, getAllBlogs, createBlog, updateBlog, deleteBlog } = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
router.get('/',        getBlogs);
router.get('/all',     protect, getAllBlogs);
router.post('/',       protect, createBlog);
router.put('/:id',    protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
module.exports = router;
`);

writeFileSync('routes/messageRoutes.js', `const express = require('express');
const router  = express.Router();
const { sendMessage, getMessages, markRead, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
router.post('/',           sendMessage);
router.get('/',            protect, getMessages);
router.put('/:id/read',   protect, markRead);
router.delete('/:id',     protect, deleteMessage);
module.exports = router;
`);

writeFileSync('routes/testimonialRoutes.js', `const express = require('express');
const router  = express.Router();
const { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } = require('../controllers/testimonialController');
const { protect } = require('../middleware/authMiddleware');
router.get('/',        getTestimonials);
router.post('/',       protect, createTestimonial);
router.put('/:id',    protect, updateTestimonial);
router.delete('/:id', protect, deleteTestimonial);
module.exports = router;
`);

writeFileSync('routes/skillRoutes.js', `const express = require('express');
const router  = express.Router();
const { getSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
router.get('/',        getSkills);
router.post('/',       protect, createSkill);
router.put('/:id',    protect, updateSkill);
router.delete('/:id', protect, deleteSkill);
module.exports = router;
`);

writeFileSync('routes/profileRoutes.js', `const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
router.get('/',  getProfile);
router.put('/',  protect, updateProfile);
module.exports = router;
`);

writeFileSync('routes/analyticsRoutes.js', `const express = require('express');
const router  = express.Router();
const { getStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
router.get('/', protect, getStats);
module.exports = router;
`);

console.log(`
╔════════════════════════════════════════════════════╗
║   সব ফাইল সম্পূর্ণভাবে তৈরি হয়েছে!              ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  এখন করুন:                                        ║
║  1. node server.js                                 ║
║                                                    ║
║  2. নতুন terminal এ admin তৈরি করুন:              ║
║     POST /api/auth/register                        ║
║     { name, email, password }                      ║
║                                                    ║
║  API Routes:                                       ║
║  GET  /api/projects     → সব projects             ║
║  GET  /api/blogs        → published blogs          ║
║  POST /api/messages     → contact form             ║
║  GET  /api/testimonials → client reviews           ║
║  GET  /api/skills       → skills                   ║
║  GET  /api/profile      → profile info             ║
║  GET  /api/analytics    → dashboard stats (auth)   ║
╚════════════════════════════════════════════════════╝
`);
