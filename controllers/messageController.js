const Message = require('../models/Message');

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
