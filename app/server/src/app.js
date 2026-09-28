const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS) so React can communicate with Express
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// -------------------------------------------------------------
// 1. Root & Health Check Endpoints
// Essential for CI/CD post-deployment verification and monitoring
// -------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({
    message: 'DevOps CI/CD Demo API is running!',
    version: '1.0.0',
    documentation: '/api/health or /api/tasks'
  });
});

app.get('/api/health', async (req, res) => {
  let dbStatus = 'disconnected';
  
  try {
    // Check if database query responds
    const dbRes = await pool.query('SELECT NOW()');
    if (dbRes && dbRes.rows.length > 0) {
      dbStatus = 'connected';
    }
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: dbStatus,
    environment: process.env.NODE_ENV || 'development'
  });
});

// -------------------------------------------------------------
// 2. Tasks CRUD Endpoints
// -------------------------------------------------------------

// GET: Fetch all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json({ success: true, count: result.rows.length, data: result.rows });
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    // If the table doesn't exist yet, auto-create it and retry
    if (err.message && err.message.includes('relation "tasks" does not exist')) {
      try {
        if (pool.initDB) await pool.initDB();
        const retryResult = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
        return res.json({ success: true, count: retryResult.rows.length, data: retryResult.rows });
      } catch (retryErr) {
        console.error('Auto-recovery retry failed:', retryErr.message);
      }
    }
    res.status(500).json({ success: false, error: 'Database query failed: ' + err.message });
  }
});

// POST: Create a new task
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, error: 'Task title is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title.trim(), description ? description.trim() : '']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error creating task:', err.message);
    res.status(500).json({ success: false, error: 'Failed to insert task' });
  }
});

// PUT: Update / Toggle task status
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { completed, title, description } = req.body;

  try {
    // Check if task exists
    const check = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const currentTask = check.rows[0];
    const newCompleted = completed !== undefined ? completed : currentTask.completed;
    const newTitle = title !== undefined ? title : currentTask.title;
    const newDescription = description !== undefined ? description : currentTask.description;

    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *',
      [newTitle, newDescription, newCompleted, id]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Error updating task:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
});

// DELETE: Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    res.json({ success: true, message: `Task ${id} deleted successfully` });
  } catch (err) {
    console.error('Error deleting task:', err.message);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
});

module.exports = app;
