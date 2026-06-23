const mongoose = require('mongoose');

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
