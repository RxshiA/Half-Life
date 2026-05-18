import { hashPassword, comparePassword } from '../password';

describe('Password utilities', () => {
  const plaintext = 'MySecret@123';

  describe('hashPassword', () => {
    it('returns a string different from the plaintext', async () => {
      const hash = await hashPassword(plaintext);
      expect(hash).not.toBe(plaintext);
      expect(hash.startsWith('$2b$')).toBe(true);
    });

    it('produces different hashes for the same input (salt)', async () => {
      const hash1 = await hashPassword(plaintext);
      const hash2 = await hashPassword(plaintext);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('returns true for matching plaintext and hash', async () => {
      const hash = await hashPassword(plaintext);
      const result = await comparePassword(plaintext, hash);
      expect(result).toBe(true);
    });

    it('returns false for non-matching plaintext', async () => {
      const hash = await hashPassword(plaintext);
      const result = await comparePassword('WrongPassword', hash);
      expect(result).toBe(false);
    });
  });
});
