import prisma from '../../lib/prisma';
import { AppError } from '../../errors/AppError';
import { toPublicUser, PublicUser } from '../auth/auth.service';
import { UpdateProfileInput } from './users.schemas';

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }
  return toPublicUser(user);
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput,
): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.fullName !== undefined && { fullName: input.fullName }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.addressLine1 !== undefined && { addressLine1: input.addressLine1 }),
      ...(input.addressLine2 !== undefined && { addressLine2: input.addressLine2 }),
      ...(input.city !== undefined && { city: input.city }),
      ...(input.state !== undefined && { state: input.state }),
      ...(input.postalCode !== undefined && { postalCode: input.postalCode }),
      ...(input.country !== undefined && { country: input.country }),
    },
  });

  return toPublicUser(updated);
}
