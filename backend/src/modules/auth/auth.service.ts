import { User } from '@prisma/client';
import prisma from '../../lib/prisma';
import { hashPassword, comparePassword } from '../../lib/password';
import { signAccessToken } from '../../lib/jwt';
import { AppError } from '../../errors/AppError';
import { RegisterInput, LoginInput } from './auth.schemas';

export type PublicUser = Omit<User, 'passwordHash'>;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _, ...publicUser } = user;
  return publicUser;
}

export async function register(
  input: RegisterInput,
): Promise<{ user: PublicUser; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('EMAIL_TAKEN', 'An account with this email already exists', 409);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country ?? 'AU',
    },
  });

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError('INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const token = signAccessToken({ sub: user.id, role: user.role });
  return { user: toPublicUser(user), token };
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }
  return toPublicUser(user);
}
