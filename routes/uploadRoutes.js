const express    = require('express');
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
