import { AppError } from '../../../errors/AppError';

// ---- mock prisma ----
const mockFindUnique = jest.fn();
const mockCreate = jest.fn();
jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

// ---- mock password ----
jest.mock('../../../lib/password', () => ({
  hashPassword: jest.fn().mockResolvedValue('$2b$12$hashedpwd'),
  comparePassword: jest.fn(),
}));

import { register, login, getMe } from '../auth.service';
import { comparePassword } from '../../../lib/password';

const mockCompare = comparePassword as jest.Mock;

const baseUser = {
  id: 'u1',
  email: 'test@example.com',
  passwordHash: '$2b$12$hashedpwd',
  fullName: 'Test User',
  phone: '+61400000001',
  addressLine1: '1 Test St',
  addressLine2: null,
  city: 'Sydney',
  state: 'NSW',
  postalCode: '2000',
  country: 'AU',
  role: 'USER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('authService.register', () => {
  it('creates a user and returns public user + token', async () => {
    mockFindUnique.mockResolvedValue(null);
    mockCreate.mockResolvedValue(baseUser);

    const result = await register({
      email: 'test@example.com',
      password: 'Password1',
      fullName: 'Test User',
      phone: '+61400000001',
      addressLine1: '1 Test St',
      city: 'Sydney',
      state: 'NSW',
      postalCode: '2000',
      country: 'AU',
    });

    expect(result.user.email).toBe('test@example.com');
    expect((result.user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
    expect(typeof result.token).toBe('string');
  });

  it('throws 409 EMAIL_TAKEN when email already exists', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    await expect(
      register({
        email: 'test@example.com',
        password: 'Password1',
        fullName: 'Test',
        phone: '+1',
        addressLine1: '1 St',
        city: 'City',
        state: 'ST',
        postalCode: '1234',
        country: 'AU',
      }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN', status: 409 });
  });
});

describe('authService.login', () => {
  it('returns user + token for valid credentials', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    mockCompare.mockResolvedValue(true);

    const result = await login({ email: 'test@example.com', password: 'Password1' });
    expect(result.user.id).toBe('u1');
    expect(typeof result.token).toBe('string');
  });

  it('throws 401 for unknown email', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(login({ email: 'nope@x.com', password: 'pw' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      status: 401,
    });
  });

  it('throws 401 for wrong password', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    mockCompare.mockResolvedValue(false);
    await expect(login({ email: 'test@example.com', password: 'wrong' })).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
      status: 401,
    });
  });
});

describe('authService.getMe', () => {
  it('returns the public user when found', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    const user = await getMe('u1');
    expect(user.id).toBe('u1');
  });

  it('throws 404 when user does not exist', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(getMe('ghost')).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
