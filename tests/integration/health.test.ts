import request from 'supertest';
import app from '../../src/app';

describe('Health endpoints', () => {
  describe('GET /health', () => {
    it('returns 200 and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /ready', () => {
    it('returns 200 when database is reachable, or 503 when not', async () => {
      const res = await request(app).get('/ready');
      expect([200, 503]).toContain(res.status);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toMatch(/^(ready|not ready)$/);
    });
  });
});
