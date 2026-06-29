const Service = require('../models/Service');

exports.getServices = async (req, res) => {
  try {
    const services = await Service.find({ active: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.createService = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.features === 'string') body.features = body.features.split(',').map(f => f.trim()).filter(Boolean);
    const service = await Service.create(body);
    res.status(201).json({ success: true, data: service });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.updateService = async (req, res) => {
  try {
    const body = { ...req.body };
    if (typeof body.features === 'string') body.features = body.features.split(',').map(f => f.trim()).filter(Boolean);
    const service = await Service.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: service });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
