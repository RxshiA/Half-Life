import request from 'supertest';
import { createApp } from '../../../app';
import prisma from '../../../lib/prisma';
import { cleanDatabase, createTestUser } from '../../../../tests/helpers/auth';

const app = createApp();

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  const validPayload = {
    email: 'newuser@test.com',
    password: 'Password1',
    fullName: 'New User',
    phone: '+61400000001',
    addressLine1: '1 Test St',
    city: 'Sydney',
    state: 'NSW',
    postalCode: '2000',
    country: 'AU',
  };

  it('returns 201 with user and token on success', async () => {
    const res = await request(app).post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(validPayload.email);
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(typeof res.body.token).toBe('string');
  });

  it('returns 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validPayload, password: 'weak' });
    expect(res.status).toBe(400);
  });

  it('returns 409 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validPayload);
    const res = await request(app).post('/api/auth/register').send(validPayload);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await createTestUser({ email: 'user@test.com', password: 'Test@1234' });
  });

  it('returns 200 with user and token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'Test@1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('user@test.com');
    expect(typeof res.body.token).toBe('string');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'WrongPwd' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ghost@test.com', password: 'Test@1234' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 200 with user when authenticated', async () => {
    await createTestUser({ email: 'me@test.com', password: 'Test@1234' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'me@test.com', password: 'Test@1234' });
    const token = loginRes.body.token;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@test.com');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
