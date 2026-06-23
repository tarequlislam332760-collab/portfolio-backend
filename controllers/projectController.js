const Project = require('../models/Project');

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createProject = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.tech === 'string') {
      body.tech = body.tech.split(',').map(t => t.trim()).filter(Boolean);
    }
    const project = await Project.create(body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.tech === 'string') {
      body.tech = body.tech.split(',').map(t => t.trim()).filter(Boolean);
    }
    const project = await Project.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, message: 'Project deleted', data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProjects, createProject, updateProject, deleteProject };
