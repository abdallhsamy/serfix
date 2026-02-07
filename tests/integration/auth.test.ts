import request from 'supertest';
import app from '../../src/app';
import { truncateDb, isDbAvailable } from '../helpers';

let dbAvailable = false;
beforeAll(async () => {
  dbAvailable = await isDbAvailable();
  if (dbAvailable) await truncateDb();
});
beforeEach(async () => {
  if (!dbAvailable) return;
  await truncateDb();
});

describe('POST /api/v1/auth/register', () => {
  const validBody = {
    email: 'user@example.com',
    password: 'Password1',
    name: 'Test User',
  };

  it('creates user and returns 201 with user and accessToken', async () => {
    if (!dbAvailable) return;
    const res = await request(app).post('/api/v1/auth/register').send(validBody);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      email: validBody.email,
      name: validBody.name,
      role: 'USER',
    });
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('expiresIn');
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('returns 409 when email already exists', async () => {
    if (!dbAvailable) return;
    await request(app).post('/api/v1/auth/register').send(validBody);
    const res = await request(app).post('/api/v1/auth/register').send(validBody);
    expect(res.status).toBe(409);
    expect(res.body.error).toContain('already registered');
    expect(res.body.code).toBe('CONFLICT');
  });

  it('returns 400 when email is invalid', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validBody, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when password is too short', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validBody, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when password has no number', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validBody, password: 'PasswordOnly' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when password has no uppercase', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...validBody, password: 'password1' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when name is missing', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: validBody.email, password: validBody.password });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when body is empty', async () => {
    if (!dbAvailable) return;
    const res = await request(app).post('/api/v1/auth/register').send({});
    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/auth/login', () => {
  const registerAndGetBody = async () => {
    const body = { email: 'login@example.com', password: 'Password1', name: 'Login User' };
    await request(app).post('/api/v1/auth/register').send(body);
    return body;
  };

  it('returns 200 with user and accessToken for valid credentials', async () => {
    if (!dbAvailable) return;
    const body = await registerAndGetBody();
    const res = await request(app).post('/api/v1/auth/login').send({
      email: body.email,
      password: body.password,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(body.email);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('expiresIn');
  });

  it('returns 401 for wrong password', async () => {
    if (!dbAvailable) return;
    await registerAndGetBody();
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'login@example.com', password: 'WrongPassword1' });
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Invalid');
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 for non-existent email', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password: 'Password1' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('returns 400 when email is invalid', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'bad', password: 'Password1' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 when password is missing', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'user@example.com' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});
