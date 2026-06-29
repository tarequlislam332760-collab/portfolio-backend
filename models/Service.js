const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  icon:     { type: String, default: '🌐' },
  title:    { type: String, required: true },
  desc:     { type: String, required: true },
  color:    { type: String, default: '#00D4AA' },
  features: [{ type: String }],
  tag:      { type: String, default: '' },
  order:    { type: Number, default: 0 },
  active:   { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
