import fs from "fs";

const code = `const express = require('express');
const router  = express.Router();
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'portfolio',
      transformation: [{ width: 800, height: 1000, crop: 'fill', gravity: 'face' }],
    });

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
`;

fs.writeFileSync("routes/uploadRoutes.js", code, "utf8");
console.log("✅ routes/uploadRoutes.js তৈরি হয়েছে!");
