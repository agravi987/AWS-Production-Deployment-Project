import React, { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [actionError, setActionError] = useState('');

  // 1. Fetch Backend & RDS Database Health Check
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

  // 2. Fetch Tasks from Amazon RDS via Express API
  const fetchTasks = async () => {
    setTasksLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const result = await res.json();
      if (result.success) {
        setTasks(result.data);
      }
    } catch (err) {
      console.error('Failed to load tasks from RDS:', err);
      setActionError('Could not load records from PostgreSQL database.');
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchTasks();
  }, []);

  // 3. Create a new task in Amazon RDS PostgreSQL
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
        setActionError(result.error || 'Failed to create record in RDS');
      }
    } catch (err) {
      setActionError('Network error while persisting task to RDS database');
    }
  };

  // 4. Toggle task status in Amazon RDS PostgreSQL
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
      setActionError('Failed to update task state in RDS');
    }
  };

  // 5. Delete task from Amazon RDS PostgreSQL
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
      setActionError('Failed to delete record from RDS');
    }
  };

  const isBackendUp = health && health.status === 'UP';
  const isDbConnected = health && health.database === 'connected';

  return (
    <div className="container">
      {/* AWS Cloud Architecture Header */}
      <header className="header">
        <div className="aws-badge-top">AWS Well-Architected Framework</div>
        <h1>☁️ AWS Production Cloud Architecture</h1>
        <p>Enterprise Multi-Tier Deployment with ALB, EC2 Auto Scaling & Amazon RDS</p>

        <div className="badges-row">
          <span className="badge">🌐 Route 53 (DNS)</span>
          <span className="badge">🔒 ACM (SSL/TLS)</span>
          <span className="badge">⚖️ Application Load Balancer</span>
          <span className="badge">📈 EC2 Auto Scaling</span>
          <span className="badge">🐘 Amazon RDS PostgreSQL</span>
          <span className="badge">🔐 AWS Secrets Manager</span>
          <span className="badge">📊 CloudWatch & SNS</span>
        </div>
      </header>

      {/* 3-Tier Multi-AZ Cloud Architecture Visualizer */}
      <section className="card">
        <h2>
          <span>🏗️ 3-Tier Multi-AZ Cloud Architecture</span>
          <span className="badge region-badge">Region: us-east-1</span>
        </h2>
        
        <div className="cloud-tiers-container">
          {/* Tier 1: Web & Ingress */}
          <div className="cloud-tier-card web-tier">
            <div className="tier-header">
              <span className="tier-icon">⚖️</span>
              <div>
                <div className="tier-name">Tier 1: Web & Routing</div>
                <div className="tier-sub">Public Subnets (10.0.1.0/24 & 10.0.2.0/24)</div>
              </div>
            </div>
            <ul className="tier-details">
              <li><strong>Ingress:</strong> Internet (0.0.0.0/0 on Ports 80 & 443)</li>
              <li><strong>Load Balancer:</strong> <code>production-alb</code> (Dual AZ)</li>
              <li><strong>Security Group:</strong> <code>production-alb-sg</code></li>
              <li><strong>Health Probes:</strong> <code>HTTP:80/api/health</code></li>
            </ul>
          </div>

          <div className="tier-connector">➔</div>

          {/* Tier 2: Compute */}
          <div className="cloud-tier-card app-tier">
            <div className="tier-header">
              <span className="tier-icon">💻</span>
              <div>
                <div className="tier-name">Tier 2: Compute Fleet</div>
                <div className="tier-sub">App Subnets (10.0.11.0/24 & 10.0.12.0/24)</div>
              </div>
            </div>
            <ul className="tier-details">
              <li><strong>Auto Scaling:</strong> <code>production-asg</code> (2-4 Nodes)</li>
              <li><strong>Security Group:</strong> <code>production-ec2-app-sg</code></li>
              <li><strong>Chained Defense:</strong> Traffic accepted ONLY from ALB</li>
              <li><strong>IAM Profile:</strong> <code>production-ec2-secrets-role</code></li>
            </ul>
          </div>

          <div className="tier-connector">➔</div>

          {/* Tier 3: Data */}
          <div className="cloud-tier-card db-tier">
            <div className="tier-header">
              <span className="tier-icon">🐘</span>
              <div>
                <div className="tier-name">Tier 3: Database Storage</div>
                <div className="tier-sub">Private DB Subnets (10.0.21.0/24 & 10.0.22.0/24)</div>
              </div>
            </div>
            <ul className="tier-details">
              <li><strong>Database:</strong> Amazon RDS PostgreSQL 16</li>
              <li><strong>Subnet Group:</strong> <code>production-db-subnet-group</code></li>
              <li><strong>Security Group:</strong> <code>production-rds-db-sg</code></li>
              <li><strong>Public Ingress:</strong> Strict NO 🔒 (Zero internet access)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Live AWS Production Telemetry & Health Checks */}
      <section className="card">
        <h2>
          <span>🩺 Live Multi-Tier Telemetry & Health Checks</span>
          <button
            onClick={checkHealth}
            className="btn btn-refresh"
          >
            🔄 Refresh Health
          </button>
        </h2>

        <div className="grid-cols-3">
          {/* Web Tier Status */}
          <div className="metric-box">
            <div className="label">Web Tier / ALB Route</div>
            <div className="value">
              {healthLoading ? (
                'Probing /api/health...'
              ) : isBackendUp ? (
                <span className="badge success">● HEALTHY (200 OK)</span>
              ) : (
                <span className="badge danger">● UNHEALTHY</span>
              )}
            </div>
            <div className="metric-sub">
              Target Group: <code>production-tg</code>
            </div>
          </div>

          {/* App Tier Status */}
          <div className="metric-box">
            <div className="label">App Tier / EC2 Fleet</div>
            <div className="value">
              {healthLoading ? (
                'Checking Node.js...'
              ) : isBackendUp ? (
                <span className="badge success">● ONLINE (UP)</span>
              ) : (
                <span className="badge danger">● DOWN</span>
              )}
            </div>
            <div className="metric-sub">
              Env: <strong>{health?.environment || 'production'}</strong> | Uptime: <strong>{health?.uptimeSeconds !== undefined ? `${health.uptimeSeconds}s` : 'N/A'}</strong>
            </div>
          </div>

          {/* Database Tier Status */}
          <div className="metric-box">
            <div className="label">Database Tier / RDS PostgreSQL</div>
            <div className="value">
              {healthLoading ? (
                'Testing Query...'
              ) : isDbConnected ? (
                <span className="badge success">● CONNECTED</span>
              ) : (
                <span className="badge danger">● DISCONNECTED</span>
              )}
            </div>
            <div className="metric-sub">
              Auth: <strong>AWS Secrets Manager</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Infrastructure Specs Bar */}
      <div className="cloud-specs-bar">
        <div className="spec-item">
          <span className="spec-label">VPC CIDR:</span>
          <span className="spec-value">10.0.0.0/16</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Availability Zones:</span>
          <span className="spec-value">us-east-1a & us-east-1b</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Security:</span>
          <span className="spec-value">Chained Zero-Trust</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Secrets Vault:</span>
          <span className="spec-value">production/database/credentials</span>
        </div>
      </div>

      {/* Amazon RDS PostgreSQL CRUD Validation */}
      <section className="card">
        <h2>
          <span>📋 Amazon RDS PostgreSQL Live Verification</span>
          <span className="badge db-count-badge">{tasks.length} Records</span>
        </h2>
        <p className="section-desc">
          Validates end-to-end data persistence across the full 3-tier AWS stack: 
          <strong> Client Browser ➔ ALB ➔ EC2 (Docker) ➔ Amazon RDS (PostgreSQL)</strong>.
        </p>

        {actionError && (
          <div className="alert-error">
            ⚠️ {actionError}
          </div>
        )}

        {/* Task Form */}
        <form onSubmit={handleCreateTask} className="task-form">
          <input
            type="text"
            placeholder="Deploy checklist item (e.g., Verify Multi-AZ failover)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Architecture notes / verification criteria"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            + Persist to RDS
          </button>
        </form>

        {/* Tasks List */}
        {tasksLoading ? (
          <p className="empty-state">Querying PostgreSQL database...</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">No records found. Insert your first verification task above!</p>
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
                    title="Mark verified / pending"
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
                  title="Delete record from Amazon RDS"
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
