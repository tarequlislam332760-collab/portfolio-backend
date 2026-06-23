const express = require('express');
const cors    = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173','http://localhost:5174','https://tarek.dev'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect(process.env.MONGO_URI)
  .then(conn => console.log('MongoDB Connected: ' + conn.connection.host))
  .catch(err  => { console.error('DB Error: ' + err.message); process.exit(1); });

app.get('/', (req, res) => res.json({ success: true, message: 'Tarek.dev API running!' }));

app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/projects',     require('./routes/projectRoutes'));
app.use('/api/blogs',        require('./routes/blogRoutes'));
app.use('/api/messages',     require('./routes/messageRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/skills',       require('./routes/skillRoutes'));
app.use('/api/profile',      require('./routes/profileRoutes'));
app.use('/api/analytics',    require('./routes/analyticsRoutes'));

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
