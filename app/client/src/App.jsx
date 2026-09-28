import React, { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [actionError, setActionError] = useState('');

  // 1. Fetch Backend & Database Health
  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      setHealth({
        status: 'DOWN',
        database: 'unreachable',
        error: err.message,
      });
    } finally {
      setHealthLoading(false);
    }
  };

  // 2. Fetch Tasks from Postgres Database via Express API
  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const result = await res.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setActionError('Could not load tasks from database.');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchTasks();
  }, []);

  // 3. Create a new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDesc }),
      });
      const result = await res.json();
      if (result.success) {
        setTasks([...tasks, result.data]);
        setNewTitle('');
        setNewDesc('');
        setActionError('');
      } else {
        setActionError(result.error || 'Failed to create task');
      }
    } catch (err) {
      setActionError('Network error while creating task');
    }
  };

  // 4. Toggle task completion status
  const handleToggleTask = async (task) => {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const result = await res.json();
      if (result.success) {
        setTasks(tasks.map((t) => (t.id === task.id ? result.data : t)));
      }
    } catch (err) {
      setActionError('Failed to update task');
    }
  };

  // 5. Delete task
  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        setTasks(tasks.filter((t) => t.id !== id));
      }
    } catch (err) {
      setActionError('Failed to delete task');
    }
  };

  const isBackendUp = health && health.status === 'UP';
  const isDbConnected = health && health.database === 'connected';

  return (
    <div className="container">
      {/* Main Header */}
      <header className="header">
        <h1>🚀 DevOps CI/CD Pipeline Project</h1>
        <p>Automated Delivery from Git Push to Docker Hub to AWS EC2</p>

        <div className="badges-row">
          <span className="badge">⚛️ React (Frontend)</span>
          <span className="badge">🟢 Express (Backend)</span>
          <span className="badge">🐘 PostgreSQL (Database)</span>
          <span className="badge">🐳 Docker</span>
          <span className="badge">☁️ AWS EC2</span>
          <span className="badge">⚡ GitHub Actions</span>
        </div>
      </header>

      {/* CI/CD Pipeline Flow Visualizer */}
      <section className="card">
        <h2>🔄 CI/CD Pipeline Automation Stages</h2>
        <div className="pipeline-flow">
          <div className="flow-step">
            <span className="icon">💻</span>
            <span className="title">1. Git Push</span>
          </div>
          <span className="flow-arrow">→</span>
          <div className="flow-step">
            <span className="icon">🧪</span>
            <span className="title">2. Lint & Tests</span>
          </div>
          <span className="flow-arrow">→</span>
          <div className="flow-step">
            <span className="icon">🛡️</span>
            <span className="title">3. Security Scan</span>
          </div>
          <span className="flow-arrow">→</span>
          <div className="flow-step">
            <span className="icon">📦</span>
            <span className="title">4. Docker Hub</span>
          </div>
          <span className="flow-arrow">→</span>
          <div className="flow-step">
            <span className="icon">☁️</span>
            <span className="title">5. Deploy to EC2</span>
          </div>
          <span className="flow-arrow">→</span>
          <div className="flow-step">
            <span className="icon">🩺</span>
            <span className="title">6. Health Check</span>
          </div>
        </div>
      </section>

      {/* Live System Health Monitor */}
      <section className="card">
        <h2>
          <span>🩺 Live Health & System Status</span>
          <button
            onClick={checkHealth}
            className="btn"
            style={{ marginLeft: 'auto', padding: '4px 10px', fontSize: '0.8rem', background: '#334155', color: '#fff' }}
          >
            Refresh
          </button>
        </h2>

        <div className="grid-cols-3">
          <div className="metric-box">
            <div className="label">Backend API Status</div>
            <div className="value">
              {healthLoading ? (
                'Checking...'
              ) : isBackendUp ? (
                <span className="badge success">● ONLINE (UP)</span>
              ) : (
                <span className="badge danger">● OFFLINE (DOWN)</span>
              )}
            </div>
          </div>

          <div className="metric-box">
            <div className="label">PostgreSQL Database</div>
            <div className="value">
              {healthLoading ? (
                'Checking...'
              ) : isDbConnected ? (
                <span className="badge success">● CONNECTED</span>
              ) : (
                <span className="badge danger">● DISCONNECTED</span>
              )}
            </div>
          </div>

          <div className="metric-box">
            <div className="label">Environment & Uptime</div>
            <div className="value" style={{ fontSize: '0.9rem' }}>
              Env: <strong>{health?.environment || 'N/A'}</strong> <br />
              Uptime: <strong>{health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s` : 'N/A'}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Task Management (Validating Database Persistence) */}
      <section className="card">
        <h2>📋 PostgreSQL Database Tasks (CRUD Test)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
          This section proves your 3-tier architecture is communicating properly: React → Express API → PostgreSQL.
        </p>

        {actionError && (
          <div style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
            ⚠️ {actionError}
          </div>
        )}

        {/* Form to Add Task */}
        <form onSubmit={handleCreateTask} className="task-form">
          <input
            type="text"
            placeholder="Task title (e.g., Verify Docker images)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            + Add Task
          </button>
        </form>

        {/* Task Listing */}
        {tasksLoading ? (
          <p className="empty-state">Loading tasks from database...</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">No tasks found. Add your first task above!</p>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-content">
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleTask(task)}
                    title="Mark complete/incomplete"
                  />
                  <div>
                    <div className={`task-title ${task.completed ? 'completed' : ''}`}>
                      {task.title}
                    </div>
                    {task.description && <div className="task-desc">{task.description}</div>}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="btn btn-delete"
                  title="Delete task from database"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
