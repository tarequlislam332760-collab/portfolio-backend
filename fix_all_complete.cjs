// Run in BACKEND folder: node fix_all_complete.cjs
const fs = require('fs');

// ══════════════════════════════════════════
// 1. .env — নতুন Cloudinary credentials
// ══════════════════════════════════════════
fs.writeFileSync('.env', `PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://Protfolio49:tareq49@cluster0.aormi1s.mongodb.net/portfolio_db?appName=Cluster0&retryWrites=true&w=majority
JWT_SECRET=tarek_super_secret_jwt_key_2025_change_this
CLOUDINARY_CLOUD_NAME=dfe3wlx4u
CLOUDINARY_API_KEY=734921899346989
CLOUDINARY_API_SECRET=hUNeDDTVTXvOtH9wBh7fZJG_XP4
`);
console.log('✅ .env updated with new Cloudinary credentials');

// ══════════════════════════════════════════
// 2. config/cloudinary.js — proper config
// ══════════════════════════════════════════
fs.writeFileSync('config/cloudinary.js', `const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
`);
console.log('✅ config/cloudinary.js updated');

// ══════════════════════════════════════════
// 3. routes/uploadRoutes.js — complete upload route
// ══════════════════════════════════════════
fs.writeFileSync('routes/uploadRoutes.js', `const express    = require('express');
const router     = express.Router();
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// POST /api/upload
// Body: { image: "data:image/jpeg;base64,..." }
// Returns: { url: "https://res.cloudinary.com/..." }
router.post('/', protect, async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Upload base64 image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: 'portfolio/profile',
      transformation: [
        { width: 800, height: 1000, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });

  } catch (err) {
    console.error('Cloudinary upload error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
`);
console.log('✅ routes/uploadRoutes.js complete');

// ══════════════════════════════════════════
// 4. models/Profile.js — add stat fields
// ══════════════════════════════════════════
fs.writeFileSync('models/Profile.js', `const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  name:      { type: String, default: 'Tarikul Islam Tarek' },
  title:     { type: String, default: 'MERN Full Stack Developer' },
  subtitle:  { type: String, default: 'Digital Marketing Specialist' },
  bio:       { type: String, default: 'I build high-performance MERN stack web apps.' },
  bio2:      { type: String, default: 'Deployed 2+ full-stack projects on Vercel.' },
  email:     { type: String, default: 'tareq.islam.dev@gmail.com' },
  phone:     { type: String, default: '+880 1732-483149' },
  location:  { type: String, default: 'Sylhet, Bangladesh' },
  available: { type: Boolean, default: true },
  image:     { type: String, default: '' },
  github:    { type: String, default: 'https://github.com/tarequlislam332760-collab' },
  linkedin:  { type: String, default: 'https://www.linkedin.com/in/tareq-islam3149/' },
  facebook:  { type: String, default: 'https://www.facebook.com/profile.php?id=61585040426028' },
  instagram: { type: String, default: 'https://www.instagram.com/tareq23337/' },
  whatsapp:  { type: String, default: 'https://wa.me/8801732483149' },
  cvLink:    { type: String, default: '#' },
  infoRole:  { type: String, default: 'MERN Developer' },
  infoWork:  { type: String, default: 'Remote Worldwide' },
  // Stats fields
  stat1n:    { type: String, default: '2+' },
  stat1l:    { type: String, default: 'Projects Live' },
  stat2n:    { type: String, default: '3+' },
  stat2l:    { type: String, default: 'Years Exp' },
  stat3n:    { type: String, default: '20+' },
  stat3l:    { type: String, default: 'Clients' },
  stat4n:    { type: String, default: '15+' },
  stat4l:    { type: String, default: 'Technologies' },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
`);
console.log('✅ models/Profile.js — stat fields added');

// ══════════════════════════════════════════
// 5. server.js — ensure upload route included
// ══════════════════════════════════════════
let server = fs.readFileSync('server.js', 'utf8');
if (!server.includes("uploadRoutes")) {
  server = server.replace(
    "app.use('/api/analytics'",
    "app.use('/api/upload', require('./routes/uploadRoutes'));\napp.use('/api/analytics'"
  );
  fs.writeFileSync('server.js', server, 'utf8');
  console.log('✅ server.js — upload route added');
} else {
  console.log('ℹ️  server.js — upload route already exists');
}

console.log(`
╔══════════════════════════════════════════════════════╗
║  ✅ Backend সম্পূর্ণ fix হয়েছে!                     ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  এখন চালান:                                         ║
║  node server.js                                      ║
║                                                      ║
║  Cloudinary: dfe3wlx4u (নতুন account)               ║
║  Upload endpoint: POST /api/upload                   ║
║  Stats fields: stat1n,stat1l...stat4n,stat4l         ║
╚══════════════════════════════════════════════════════╝
`);
