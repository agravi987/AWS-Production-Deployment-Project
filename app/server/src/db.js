const { Pool } = require("pg");
require("dotenv").config();

// Automatically enable SSL for Amazon RDS, and disable for local Docker
const isRDS = process.env.DB_HOST && (process.env.DB_HOST.includes('rds.amazonaws.com') || process.env.DB_SSL === 'true');

// Create a PostgreSQL connection pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'devops_db',
  ssl: isRDS ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
  console.log(" Connected to PostgreSQL database pool");
});

pool.on("error", (err) => {
  console.error(" Unexpected PostgreSQL client error:", err.message);
});

// Auto-initialize the tasks table if it does not exist
// This ensures that even if init.sql didn't run on EC2, the database is always ready
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if table is empty, insert default tasks if so
    const countRes = await pool.query("SELECT COUNT(*) FROM tasks");
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      await pool.query(`
        INSERT INTO tasks (title, description, completed) VALUES
        ('Learn CI/CD Fundamentals', 'Understand the difference between Continuous Integration and Continuous Deployment.', true),
        ('Build Docker Containers', 'Create Dockerfile for React and Express and test with Docker Compose.', true),
        ('Set up GitHub Actions Pipeline', 'Automate testing, container building, and pushing to Docker Hub.', true),
        ('Deploy to AWS EC2', 'Successfully deployed and running on AWS EC2!', true);
      `);
      console.log("✅ Default tasks seeded successfully");
    }
    console.log("✅ Database schema verified");
  } catch (err) {
    console.error("⚠️ Database auto-initialization warning:", err.message);
  }
};

module.exports = pool;
module.exports.initDB = initDB;
