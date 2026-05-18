import { User } from '@prisma/client';
import request from 'supertest';
import { Express } from 'express';
import prisma from '../../src/lib/prisma';
import { hashPassword } from '../../src/lib/password';

interface CreateUserOptions {
  email?: string;
  password?: string;
  fullName?: string;
  role?: 'USER' | 'ADMIN';
}

export async function createTestUser(options: CreateUserOptions = {}): Promise<User> {
  const passwordHash = await hashPassword(options.password ?? 'Test@1234');
  return prisma.user.create({
    data: {
      email: options.email ?? `user_${Date.now()}@test.com`,
      passwordHash,
      fullName: options.fullName ?? 'Test User',
      phone: '+61400000001',
      addressLine1: '1 Test Street',
      city: 'Sydney',
      state: 'NSW',
      postalCode: '2000',
      country: 'AU',
      role: options.role ?? 'USER',
    },
  });
}

export async function createTestAdmin(options: CreateUserOptions = {}): Promise<User> {
  return createTestUser({ ...options, role: 'ADMIN' });
}

export async function loginAndGetToken(
  app: Express,
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res.body.token as string;
}

export async function cleanDatabase(): Promise<void> {
  await prisma.shipmentEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.user.deleteMany();
}
