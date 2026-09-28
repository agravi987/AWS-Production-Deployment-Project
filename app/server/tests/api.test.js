const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/db');

// Mock the database pool so tests can run anywhere (e.g. in GitHub Actions runner)
// without needing an active PostgreSQL instance
jest.mock('../src/db', () => ({
  query: jest.fn(),
  on: jest.fn(),
  end: jest.fn(),
}));

describe(' Devops API Endpoints Test Suite', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 1. Root Endpoint Test
  test('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('DevOps CI/CD Demo API is running');
  });

  // 2. Health Check Endpoint Test (Healthy Case)
  test('GET /api/health should return UP when database responds', async () => {
    // Simulate healthy DB response
    pool.query.mockResolvedValueOnce({ rows: [{ now: new Date() }] });

    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.database).toBe('connected');
    expect(res.body).toHaveProperty('uptimeSeconds');
  });

  // 3. Health Check Endpoint Test (Degraded / DB Error Case)
  test('GET /api/health should return 503 DEGRADED when database query fails', async () => {
    // Simulate DB failure
    pool.query.mockRejectedValueOnce(new Error('Connection timeout'));

    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(503);
    expect(res.body.status).toBe('DEGRADED');
    expect(res.body.database).toContain('error');
  });

  // 4. Tasks GET Endpoint Test
  test('GET /api/tasks should return list of tasks', async () => {
    const mockTasks = [
      { id: 1, title: 'Learn CI/CD', description: 'Testing CI pipeline', completed: true },
      { id: 2, title: 'Deploy to AWS', description: 'Testing CD deployment', completed: false }
    ];

    pool.query.mockResolvedValueOnce({ rows: mockTasks });

    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.data.length).toBe(2);
  });

  // 5. Tasks POST Endpoint Test (Validation)
  test('POST /api/tasks should return 400 if title is empty', async () => {
    const res = await request(app).post('/api/tasks').send({ title: '', description: 'No title' });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Task title is required');
  });

  // 6. Tasks POST Endpoint Test (Success)
  test('POST /api/tasks should create a task when valid data is provided', async () => {
    const newTask = { id: 3, title: 'Write Dockerfile', description: 'Multi-stage build', completed: false };
    pool.query.mockResolvedValueOnce({ rows: [newTask] });

    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'Write Dockerfile', description: 'Multi-stage build' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Write Dockerfile');
  });
});
