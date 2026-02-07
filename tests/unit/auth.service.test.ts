import * as authService from '../../src/modules/auth/auth.service';

describe('auth.service', () => {
  describe('verifyToken', () => {
    it('throws AppError 401 for invalid token', () => {
      expect(() => authService.verifyToken('invalid-token')).toThrow('Invalid or expired token');
      try {
        authService.verifyToken('invalid');
      } catch (e: unknown) {
        expect(e).toHaveProperty('statusCode', 401);
        expect(e).toHaveProperty('code', 'UNAUTHORIZED');
      }
    });

    it('throws for malformed JWT', () => {
      expect(() => authService.verifyToken('not.a.jwt')).toThrow();
    });

    it('returns payload for valid token', () => {
      const payload = { userId: 'u1', email: 'u@example.com', role: 'USER' };
      const token = authService.signToken(payload);
      const decoded = authService.verifyToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe('hashPassword and verifyPassword', () => {
    it('hashes password and verification succeeds', async () => {
      const password = 'SecurePass1';
      const hash = await authService.hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
      const valid = await authService.verifyPassword(password, hash);
      expect(valid).toBe(true);
    });

    it('verifyPassword returns false for wrong password', async () => {
      const hash = await authService.hashPassword('RightPass1');
      const valid = await authService.verifyPassword('WrongPass1', hash);
      expect(valid).toBe(false);
    });
  });

  describe('signToken', () => {
    it('produces a string token', () => {
      const token = authService.signToken({
        userId: 'id',
        email: 'e@e.com',
        role: 'ADMIN',
      });
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });
  });
});
