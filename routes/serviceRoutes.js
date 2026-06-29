const express = require('express');
const router  = express.Router();
const { getServices, getAllServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/',       getServices);
router.get('/all',    protect, getAllServices);
router.post('/',      protect, createService);
router.put('/:id',   protect, updateService);
router.delete('/:id',protect, deleteService);

module.exports = router;
