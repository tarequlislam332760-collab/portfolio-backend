const express = require('express');
const router  = express.Router();
const { getSkills, createSkill, updateSkill, deleteSkill } = require('../controllers/skillController');
const { protect } = require('../middleware/authMiddleware');
router.get('/',        getSkills);
router.post('/',       protect, createSkill);
router.put('/:id',    protect, updateSkill);
router.delete('/:id', protect, deleteSkill);
module.exports = router;
