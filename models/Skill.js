const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  category: { type: String, required: true },
  icon:     { type: String, default: '⚡' },
  color:    { type: String, default: '#00D4AA' },
  items: [{
    name:    { type: String, required: true },
    percent: { type: Number, required: true, min: 0, max: 100 },
  }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
