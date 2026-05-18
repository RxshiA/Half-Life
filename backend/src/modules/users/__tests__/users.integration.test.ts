import request from 'supertest';
import { createApp } from '../../../app';
import prisma from '../../../lib/prisma';
import { cleanDatabase, createTestUser, loginAndGetToken } from '../../../../tests/helpers/auth';

const app = createApp();

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('GET /api/users/me', () => {
  it('returns the authenticated user profile', async () => {
    const user = await createTestUser({ email: 'prof@test.com', password: 'Test@1234' });
    const token = await loginAndGetToken(app, user.email, 'Test@1234');

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('prof@test.com');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/users/me', () => {
  it('updates the user profile and returns the updated user', async () => {
    const user = await createTestUser({ email: 'upd@test.com', password: 'Test@1234' });
    const token = await loginAndGetToken(app, user.email, 'Test@1234');

    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'Updated Name', city: 'Melbourne' });

    expect(res.status).toBe(200);
    expect(res.body.user.fullName).toBe('Updated Name');
    expect(res.body.user.city).toBe('Melbourne');
  });

  it('returns 400 for invalid update data', async () => {
    const user = await createTestUser({ email: 'inv@test.com', password: 'Test@1234' });
    const token = await loginAndGetToken(app, user.email, 'Test@1234');

    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ fullName: 'X' }); // too short (min 2 chars — but 'X' is 1)

    expect(res.status).toBe(400);
  });
});
