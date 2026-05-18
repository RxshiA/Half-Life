import { AppError } from '../../../errors/AppError';

const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: (...a: unknown[]) => mockFindUnique(...a),
      update: (...a: unknown[]) => mockUpdate(...a),
    },
  },
}));

import { getProfile, updateProfile } from '../users.service';

const baseUser = {
  id: 'u1',
  email: 'a@b.com',
  passwordHash: 'hash',
  fullName: 'Alice',
  phone: '+61400000001',
  addressLine1: '1 St',
  addressLine2: null,
  city: 'Sydney',
  state: 'NSW',
  postalCode: '2000',
  country: 'AU',
  role: 'USER' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('usersService.getProfile', () => {
  it('returns public user when found', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    const user = await getProfile('u1');
    expect(user.id).toBe('u1');
    expect((user as unknown as Record<string, unknown>).passwordHash).toBeUndefined();
  });

  it('throws 404 when not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(getProfile('ghost')).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});

describe('usersService.updateProfile', () => {
  it('updates and returns updated public user', async () => {
    mockFindUnique.mockResolvedValue(baseUser);
    mockUpdate.mockResolvedValue({ ...baseUser, fullName: 'Updated' });

    const user = await updateProfile('u1', { fullName: 'Updated' });
    expect(user.fullName).toBe('Updated');
  });

  it('throws 404 when user not found', async () => {
    mockFindUnique.mockResolvedValue(null);
    await expect(updateProfile('ghost', { fullName: 'X' })).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });
});
