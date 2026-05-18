import { signAccessToken, verifyAccessToken } from '../jwt';
import { AppError } from '../../errors/AppError';

describe('JWT utilities', () => {
  const payload = { sub: 'user-123', role: 'USER' as const };

  describe('signAccessToken', () => {
    it('returns a non-empty string', () => {
      const token = signAccessToken(payload);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('produces tokens with three dot-separated segments', () => {
      const token = signAccessToken(payload);
      expect(token.split('.')).toHaveLength(3);
    });
  });

  describe('verifyAccessToken', () => {
    it('decodes a valid token and returns the original payload', () => {
      const token = signAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded.sub).toBe(payload.sub);
      expect(decoded.role).toBe(payload.role);
    });

    it('throws AppError with INVALID_TOKEN for a garbage token', () => {
      expect(() => verifyAccessToken('not.a.token')).toThrow(AppError);
      try {
        verifyAccessToken('not.a.token');
      } catch (e) {
        expect((e as AppError).code).toBe('INVALID_TOKEN');
        expect((e as AppError).status).toBe(401);
      }
    });

    it('throws AppError with TOKEN_EXPIRED for an expired token', () => {
      const jwt = require('jsonwebtoken');
      const expired = jwt.sign(
        { sub: 'user-123', role: 'USER' },
        process.env.JWT_SECRET,
        { expiresIn: '-1s' },
      );
      expect(() => verifyAccessToken(expired)).toThrow(AppError);
      try {
        verifyAccessToken(expired);
      } catch (e) {
        expect((e as AppError).code).toBe('TOKEN_EXPIRED');
      }
    });
  });
});
