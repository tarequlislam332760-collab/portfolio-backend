const express = require('express');
const router  = express.Router();
const { sendMessage, getMessages, markRead, deleteMessage } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
router.post('/',           sendMessage);
router.get('/',            protect, getMessages);
router.put('/:id/read',   protect, markRead);
router.delete('/:id',     protect, deleteMessage);
module.exports = router;
