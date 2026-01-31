const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});

module.exports = app;

const db = require('./models');

db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });

// Initialize MinIO bucket
const { initBucket } = require('./utils/minio');
initBucket();
