import { generateTrackingNumber } from '../tracking';

describe('generateTrackingNumber', () => {
  it('returns a string matching the CS-XXXXXXXX pattern', () => {
    const tn = generateTrackingNumber();
    expect(tn).toMatch(/^CS-[A-Z0-9]{8}$/);
  });

  it('generates unique values across multiple calls', () => {
    const numbers = new Set(Array.from({ length: 100 }, () => generateTrackingNumber()));
    expect(numbers.size).toBeGreaterThan(95);
  });

  it('always starts with CS-', () => {
    for (let i = 0; i < 10; i++) {
      expect(generateTrackingNumber().startsWith('CS-')).toBe(true);
    }
  });

  it('has a total length of 11 characters (CS- + 8)', () => {
    const tn = generateTrackingNumber();
    expect(tn).toHaveLength(11);
  });
});
