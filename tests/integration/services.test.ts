import request from 'supertest';
import app from '../../src/app';
import { truncateDb, createUser, isDbAvailable } from '../helpers';

const USER_PASSWORD = 'Password1';

let dbAvailable = false;
beforeAll(async () => {
  dbAvailable = await isDbAvailable();
  if (dbAvailable) await truncateDb();
});
beforeEach(async () => {
  if (!dbAvailable) return;
  await truncateDb();
});

async function getAuthToken(email: string, password: string): Promise<string> {
  const res = await request(app).post('/api/v1/auth/login').send({ email, password });
  if (res.status !== 200) throw new Error(`Login failed: ${res.body?.error}`);
  return res.body.accessToken;
}

describe('GET /api/v1/services', () => {
  it('returns 401 without Authorization header', async () => {
    const res = await request(app).get('/api/v1/services');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/services')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('returns 200 with valid token and paginated list', async () => {
    if (!dbAvailable) return;
    await createUser({ email: 'u@example.com', password: USER_PASSWORD, name: 'User', role: 'USER' });
    const token = await getAuthToken('u@example.com', USER_PASSWORD);
    const res = await request(app)
      .get('/api/v1/services')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
    expect(res.body).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.items)).toBe(true);
  });

  it('accepts page and limit query params', async () => {
    if (!dbAvailable) return;
    await createUser({ email: 'u@example.com', password: USER_PASSWORD, name: 'User', role: 'USER' });
    const token = await getAuthToken('u@example.com', USER_PASSWORD);
    const res = await request(app)
      .get('/api/v1/services?page=2&limit=5')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(5);
  });

  it('filters by isActive when provided', async () => {
    if (!dbAvailable) return;
    await createUser({ email: 'u@example.com', password: USER_PASSWORD, name: 'User', role: 'USER' });
    const token = await getAuthToken('u@example.com', USER_PASSWORD);
    const res = await request(app)
      .get('/api/v1/services?isActive=true')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe('GET /api/v1/services/:id', () => {
  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/services/some-id');
    expect(res.status).toBe(401);
  });

  it('returns 404 for non-existent service id', async () => {
    if (!dbAvailable) return;
    await createUser({ email: 'u@example.com', password: USER_PASSWORD, name: 'User', role: 'USER' });
    const token = await getAuthToken('u@example.com', USER_PASSWORD);
    const res = await request(app)
      .get('/api/v1/services/non-existent-cuid')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('returns 200 and service when found', async () => {
    if (!dbAvailable) return;
    const { prisma } = await import('../helpers');
    const svc = await prisma.service.create({
      data: { name: 'Test', description: 'Desc', slug: 'test-svc', isActive: true },
    });
    await createUser({ email: 'u@example.com', password: USER_PASSWORD, name: 'User', role: 'USER' });
    const token = await getAuthToken('u@example.com', USER_PASSWORD);
    const res = await request(app)
      .get(`/api/v1/services/${svc.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(svc.id);
    expect(res.body.name).toBe('Test');
    expect(res.body.slug).toBe('test-svc');
  });
});

describe('POST /api/v1/services (admin only)', () => {
  it('returns 403 when user is not admin', async () => {
    if (!dbAvailable) return;
    await createUser({ email: 'u@example.com', password: USER_PASSWORD, name: 'User', role: 'USER' });
    const token = await getAuthToken('u@example.com', USER_PASSWORD);
    const res = await request(app)
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Service', slug: 'new-service' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 201 and creates service when admin', async () => {
    if (!dbAvailable) return;
    await createUser({ email: 'admin@example.com', password: USER_PASSWORD, name: 'Admin', role: 'ADMIN' });
    const token = await getAuthToken('admin@example.com', USER_PASSWORD);
    const res = await request(app)
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Service', description: 'A new one', slug: 'new-service', isActive: true });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('New Service');
    expect(res.body.slug).toBe('new-service');
    expect(res.body.isActive).toBe(true);
  });

  it('returns 400 when slug is invalid', async () => {
    if (!dbAvailable) return;
    await createUser({ email: 'admin@example.com', password: USER_PASSWORD, name: 'Admin', role: 'ADMIN' });
    const token = await getAuthToken('admin@example.com', USER_PASSWORD);
    const res = await request(app)
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad Slug', slug: 'Invalid Slug!' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when slug already exists', async () => {
    if (!dbAvailable) return;
    const { prisma } = await import('../helpers');
    await prisma.service.create({
      data: { name: 'Existing', slug: 'existing-slug', isActive: true },
    });
    await createUser({ email: 'admin@example.com', password: USER_PASSWORD, name: 'Admin', role: 'ADMIN' });
    const token = await getAuthToken('admin@example.com', USER_PASSWORD);
    const res = await request(app)
      .post('/api/v1/services')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Another', slug: 'existing-slug' });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CONFLICT');
  });
});

describe('PATCH /api/v1/services/:id (admin only)', () => {
  it('returns 403 when user is not admin', async () => {
    if (!dbAvailable) return;
    const { prisma } = await import('../helpers');
    const svc = await prisma.service.create({
      data: { name: 'Svc', slug: 'svc', isActive: true },
    });
    await createUser({ email: 'u@example.com', password: USER_PASSWORD, name: 'User', role: 'USER' });
    const token = await getAuthToken('u@example.com', USER_PASSWORD);
    const res = await request(app)
      .patch(`/api/v1/services/${svc.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 200 and updates service when admin', async () => {
    if (!dbAvailable) return;
    const { prisma } = await import('../helpers');
    const svc = await prisma.service.create({
      data: { name: 'Original', slug: 'original', isActive: true },
    });
    await createUser({ email: 'admin@example.com', password: USER_PASSWORD, name: 'Admin', role: 'ADMIN' });
    const token = await getAuthToken('admin@example.com', USER_PASSWORD);
    const res = await request(app)
      .patch(`/api/v1/services/${svc.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Name');
    expect(res.body.isActive).toBe(false);
    expect(res.body.slug).toBe('original');
  });

  it('returns 404 for non-existent id', async () => {
    if (!dbAvailable) return;
    await createUser({ email: 'admin@example.com', password: USER_PASSWORD, name: 'Admin', role: 'ADMIN' });
    const token = await getAuthToken('admin@example.com', USER_PASSWORD);
    const res = await request(app)
      .patch('/api/v1/services/non-existent-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/v1/services/:id (admin only)', () => {
  it('returns 403 when user is not admin', async () => {
    if (!dbAvailable) return;
    const { prisma } = await import('../helpers');
    const svc = await prisma.service.create({
      data: { name: 'Svc', slug: 'del-svc', isActive: true },
    });
    await createUser({ email: 'u@example.com', password: USER_PASSWORD, name: 'User', role: 'USER' });
    const token = await getAuthToken('u@example.com', USER_PASSWORD);
    const res = await request(app)
      .delete(`/api/v1/services/${svc.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 200 and deletes service when admin', async () => {
    if (!dbAvailable) return;
    const { prisma } = await import('../helpers');
    const svc = await prisma.service.create({
      data: { name: 'To Delete', slug: 'to-delete', isActive: true },
    });
    await createUser({ email: 'admin@example.com', password: USER_PASSWORD, name: 'Admin', role: 'ADMIN' });
    const token = await getAuthToken('admin@example.com', USER_PASSWORD);
    const res = await request(app)
      .delete(`/api/v1/services/${svc.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
    const found = await prisma.service.findUnique({ where: { id: svc.id } });
    expect(found).toBeNull();
  });

  it('returns 404 for non-existent id', async () => {
    if (!dbAvailable) return;
    await createUser({ email: 'admin@example.com', password: USER_PASSWORD, name: 'Admin', role: 'ADMIN' });
    const token = await getAuthToken('admin@example.com', USER_PASSWORD);
    const res = await request(app)
      .delete('/api/v1/services/non-existent-id')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
