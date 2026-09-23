// ==============================================================================
// Utility Script: Test Amazon RDS PostgreSQL Connectivity
// Run this on an EC2 instance to test if the EC2 Security Group can reach RDS
// Usage: node test-rds-connection.js
// ==============================================================================

const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'devops_db',
  connectionTimeoutMillis: 5000,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  console.log(`🔍 Attempting to connect to Amazon RDS at: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}...`);
  try {
    await client.connect();
    console.log('🎉 SUCCESS: Successfully connected to Amazon RDS PostgreSQL!');
    const res = await client.query('SELECT NOW() as current_time, version() as pg_version;');
    console.log('⏰ RDS Server Time:', res.rows[0].current_time);
    console.log('🐘 PostgreSQL Version:', res.rows[0].pg_version.split(',')[0]);
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ CONNECTION FAILED:', err.message);
    console.error('\n🛠️ Debugging Checklist:');
    console.error('1. Did you attach the RDS Security Group that allows port 5432 from the EC2 Security Group?');
    console.error('2. Is your RDS instance status "Available"?');
    console.error('3. Check username, password, and DB name in your .env file.');
    process.exit(1);
  }
}

testConnection();
