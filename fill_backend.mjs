import { writeFileSync, mkdirSync } from 'fs';

['config','models','controllers','middleware','routes'].forEach(d => mkdirSync(d, { recursive: true }));

// ══ models/User.js ══════════════════════════════
writeFileSync('models/User.js', `const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// ══ models/Project.js ═══════════════════════════
writeFileSync('models/Project.js', `const mongoose = require('mongoose');
const ProjectSchema = new mongoose.Schema({
  emoji:    { type: String, default: '🚀' },
  title:    { type: String, required: true },
  desc:     { type: String, required: true },
  tech:     [{ type: String }],
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

// ══ models/Blog.js ══════════════════════════════
writeFileSync('models/Blog.js', `const mongoose = require('mongoose');
const BlogSchema = new mongoose.Schema({
  emoji:     { type: String, default: '✍️' },
  cat:       { type: String, required: true },
  title:     { type: String, required: true },
  excerpt:   { type: String, required: true },
  content:   { type: String, default: '' },
  color:     { type: String, default: '#38BDF8' },
  readTime:  { type: String, default: '5 min' },
  published: { type: Boolean, default: true },
}, { timestamps: true });
module.exports = mongoose.model('Blog', BlogSchema);
`);

// ══ models/Message.js ═══════════════════════════
writeFileSync('models/Message.js', `const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  subject: { type: String, default: '' },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  replied: { type: Boolean, default: false },
}, { timestamps: true });
module.exports = mongoose.model('Message', MessageSchema);
`);

// ══ models/Testimonial.js ═══════════════════════
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

// ══ models/Skill.js ═════════════════════════════
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

// ══ models/Profile.js ═══════════════════════════
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

// ══ middleware/authMiddleware.js ═════════════════
writeFileSync('middleware/authMiddleware.js', `const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};
`);

// ══ middleware/errorHandler.js ═══════════════════
writeFileSync('middleware/errorHandler.js', `exports.errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
`);

// ══ middleware/uploadMiddleware.js ═══════════════
writeFileSync('middleware/uploadMiddleware.js', `// Cloudinary upload middleware (add later)
exports.upload = (req, res, next) => { next(); };
`);

// ══ controllers/authController.js ═══════════════
writeFileSync('controllers/authController.js', `const User = require('../models/User');
const jwt  = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ success: false, message: 'User already exists' });
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = signToken(user._id);
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
`);

// ══ controllers/projectController.js ════════════
writeFileSync('controllers/projectController.js', `const Project = require('../models/Project');

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: project });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
`);

// ══ controllers/blogController.js ═══════════════
writeFileSync('controllers/blogController.js', `const Blog = require('../models/Blog');

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, count: blogs.length, data: blogs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createBlog = async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json({ success: true, data: blog });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!blog) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: blog });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteBlog = async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
`);

// ══ controllers/messageController.js ════════════
writeFileSync('controllers/messageController.js', `const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ success: false, message: 'Name, email and message required' });
    const msg = await Message.create({ name, email, subject, message });
    res.status(201).json({ success: true, message: 'Message sent!', data: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markRead = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: msg });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteMessage = async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
`);

// ══ controllers/testimonialController.js ════════
writeFileSync('controllers/testimonialController.js', `const Testimonial = require('../models/Testimonial');

exports.getTestimonials = async (req, res) => {
  try {
    const data = await Testimonial.find({ active: true }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: t });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
`);

// ══ controllers/analyticsController.js ══════════
writeFileSync('controllers/analyticsController.js', `const Message     = require('../models/Message');
const Project     = require('../models/Project');
const Blog        = require('../models/Blog');
const Testimonial = require('../models/Testimonial');

exports.getStats = async (req, res) => {
  try {
    const [totalMessages, unreadMessages, totalProjects, totalBlogs, totalTestimonials] =
      await Promise.all([
        Message.countDocuments(),
        Message.countDocuments({ read: false }),
        Project.countDocuments(),
        Blog.countDocuments({ published: true }),
        Testimonial.countDocuments({ active: true }),
      ]);
    const recentMessages = await Message.find().sort({ createdAt: -1 }).limit(5);
    res.json({
      success: true,
      data: {
        totalMessages,
        unreadMessages,
        totalProjects,
        totalBlogs,
        totalTestimonials,
        recentMessages,
        cards: [
          { title: 'Live Projects', value: String(totalProjects),     change: 100, icon: '🚀', color: '#00D4AA' },
          { title: 'Blog Posts',    value: String(totalBlogs),        change: 20,  icon: '✍️',  color: '#38BDF8' },
          { title: 'Messages',      value: String(totalMessages),     change: unreadMessages, icon: '✉️', color: '#818CF8' },
          { title: 'Reviews',       value: String(totalTestimonials), change: 0,   icon: '⭐', color: '#f472b6' },
        ],
      },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
`);

// ══ controllers/skillController.js ══════════════
writeFileSync('controllers/skillController.js', `const Skill = require('../models/Skill');

exports.getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1 });
    res.json({ success: true, data: skills });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createSkill = async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json({ success: true, data: skill });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!skill) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: skill });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteSkill = async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
`);

// ══ controllers/profileController.js ════════════
writeFileSync('controllers/profileController.js', `const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) profile = await Profile.create({});
    res.json({ success: true, data: profile });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(req.body);
    } else {
      profile = await Profile.findByIdAndUpdate(profile._id, req.body, { new: true, runValidators: true });
    }
    res.json({ success: true, data: profile });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};
`);

// ══ routes/authRoutes.js ═════════════════════════
writeFileSync('routes/authRoutes.js', `const express = require('express');
const router  = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login',    login);
router.get('/me', protect, getMe);

module.exports = router;
`);

// ══ routes/projectRoutes.js ══════════════════════
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

// ══ routes/blogRoutes.js ═════════════════════════
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

// ══ routes/messageRoutes.js ══════════════════════
writeFileSync('routes/messageRoutes.js', `const express = require('express');
const router  = express.Router();
const { sendMessage, getMessages, markRead, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/',            sendMessage);
router.get('/',             protect, getMessages);
router.put('/:id/read',    protect, markRead);
router.delete('/:id',      protect, deleteMessage);

module.exports = router;
`);

// ══ routes/testimonialRoutes.js ══════════════════
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

// ══ routes/analyticsRoutes.js ════════════════════
writeFileSync('routes/analyticsRoutes.js', `const express = require('express');
const router  = express.Router();
const { getStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getStats);

module.exports = router;
`);

// ══ routes/skillRoutes.js ════════════════════════
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

// ══ routes/profileRoutes.js ══════════════════════
writeFileSync('routes/profileRoutes.js', `const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',  getProfile);
router.put('/', protect, updateProfile);

module.exports = router;
`);

// ══ server.js ════════════════════════════════════
writeFileSync('server.js', `const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ── Middlewares ──────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174','https://tarek.dev'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── MongoDB ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(conn => console.log('MongoDB Connected: ' + conn.connection.host))
  .catch(err  => { console.error('DB Error: ' + err.message); process.exit(1); });

// ── Routes ───────────────────────────────────────
app.get('/', (req, res) => res.json({ success: true, message: 'Tarek.dev API running!' }));

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/projects',     require('./routes/projectRoutes'));
app.use('/api/blogs',        require('./routes/blogRoutes'));
app.use('/api/messages',     require('./routes/messageRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/skills',       require('./routes/skillRoutes'));
app.use('/api/profile',      require('./routes/profileRoutes'));
app.use('/api/analytics',    require('./routes/analyticsRoutes'));

// ── 404 ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ── Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

// ── Start ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
`);

// ══ .env check ═══════════════════════════════════
console.log(`
╔══════════════════════════════════════════════════════╗
║  সব ফাইলে কোড দেওয়া হয়েছে!                        ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  এখন এই কাজগুলো করুন:                              ║
║                                                      ║
║  1. npm install bcryptjs jsonwebtoken                ║
║                                                      ║
║  2. .env ফাইলে এই line যোগ করুন:                   ║
║     JWT_SECRET=tarek_secret_2025_portfolio           ║
║     JWT_EXPIRE=7d                                    ║
║                                                      ║
║  3. node server.js                                   ║
║                                                      ║
║  4. Admin account তৈরি করুন (একবার):               ║
║     POST http://localhost:5000/api/auth/register     ║
║     Body: {                                          ║
║       "name": "Tarek",                               ║
║       "email": "admin@tarek.dev",                    ║
║       "password": "tareq@#49"                        ║
║     }                                                ║
║                                                      ║
║  API Endpoints:                                      ║
║  GET  /api/projects     → সব projects               ║
║  GET  /api/blogs        → সব blogs                  ║
║  GET  /api/profile      → profile info              ║
║  POST /api/messages     → contact form submit        ║
║  POST /api/auth/login   → admin login                ║
║  GET  /api/analytics    → dashboard stats (auth)    ║
╚══════════════════════════════════════════════════════╝
`);
