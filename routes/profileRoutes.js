const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
router.get('/',  getProfile);
router.put('/',  protect, updateProfile);
module.exports = router;
