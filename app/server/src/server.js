const app = require('./app');
const pool = require('./db');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 DevOps Backend API running on port ${PORT}`);
  console.log(`🩺 Health check available at: http://localhost:${PORT}/api/health`);
  
  // Verify and auto-create database tables on start
  if (pool.initDB) {
    await pool.initDB();
  }
});

// Handle graceful shutdown for Docker containers
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
