const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  emoji:    { type: String, default: '🚀' },
  title:    { type: String, required: true },
  desc:     { type: String, required: true },
  tech:     [{ type: String }],
  image:    { type: String, default: '' },
  live:     { type: String, default: '' },
  github:   { type: String, default: '' },
  color:    { type: String, default: '#00D4AA' },
  cat:      { type: String, default: 'Full Stack' },
  status:   { type: String, default: 'Live' },
  featured: { type: Boolean, default: false },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
