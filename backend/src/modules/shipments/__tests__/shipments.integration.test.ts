import request from 'supertest';
import { createApp } from '../../../app';
import prisma from '../../../lib/prisma';
import {
  cleanDatabase,
  createTestUser,
  createTestAdmin,
  loginAndGetToken,
} from '../../../../tests/helpers/auth';
import { createTestShipment } from '../../../../tests/helpers/factories';

const app = createApp();

beforeEach(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('POST /api/shipments', () => {
  it('creates a shipment for an authenticated user', async () => {
    const user = await createTestUser({ email: 'creator@test.com', password: 'Test@1234' });
    const token = await loginAndGetToken(app, user.email, 'Test@1234');

    const res = await request(app)
      .post('/api/shipments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        recipientName: 'Bob',
        recipientAddress: '2 Rd, Brisbane QLD 4000',
        recipientPhone: '+61400000099',
        weightKg: 2.5,
        dimensionsCm: '30x20x10',
        packageType: 'PARCEL',
        serviceLevel: 'STANDARD',
      });

    expect(res.status).toBe(201);
    expect(res.body.shipment.trackingNumber).toMatch(/^CS-[A-Z0-9]{8}$/);
    expect(res.body.shipment.senderName).toBe(user.fullName);
  });

  it('returns 401 when not authenticated', async () => {
    const res = await request(app).post('/api/shipments').send({});
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid payload', async () => {
    const user = await createTestUser({ email: 'val@test.com', password: 'Test@1234' });
    const token = await loginAndGetToken(app, user.email, 'Test@1234');

    const res = await request(app)
      .post('/api/shipments')
      .set('Authorization', `Bearer ${token}`)
      .send({ recipientName: 'X' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/shipments', () => {
  it('returns only the user own shipments for a USER', async () => {
    const user = await createTestUser({ email: 'list@test.com', password: 'Test@1234' });
    const other = await createTestUser({ email: 'other@test.com', password: 'Test@1234' });
    await createTestShipment({ userId: user.id });
    await createTestShipment({ userId: other.id });

    const token = await loginAndGetToken(app, user.email, 'Test@1234');
    const res = await request(app)
      .get('/api/shipments')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.shipments[0].userId).toBe(user.id);
  });

  it('returns all shipments for an ADMIN', async () => {
    const user = await createTestUser({ email: 'u1@test.com', password: 'Test@1234' });
    const admin = await createTestAdmin({ email: 'adm@test.com', password: 'Test@1234' });
    await createTestShipment({ userId: user.id });
    await createTestShipment({ userId: user.id });

    const token = await loginAndGetToken(app, admin.email, 'Test@1234');
    const res = await request(app)
      .get('/api/shipments')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });
});

describe('GET /api/shipments/:id', () => {
  it('returns 200 for the shipment owner', async () => {
    const user = await createTestUser({ email: 'own@test.com', password: 'Test@1234' });
    const shipment = await createTestShipment({ userId: user.id });
    const token = await loginAndGetToken(app, user.email, 'Test@1234');

    const res = await request(app)
      .get(`/api/shipments/${shipment.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.shipment.id).toBe(shipment.id);
  });

  it('returns 403 when accessing another user shipment', async () => {
    const owner = await createTestUser({ email: 'own2@test.com', password: 'Test@1234' });
    const intruder = await createTestUser({ email: 'int@test.com', password: 'Test@1234' });
    const shipment = await createTestShipment({ userId: owner.id });
    const token = await loginAndGetToken(app, intruder.email, 'Test@1234');

    const res = await request(app)
      .get(`/api/shipments/${shipment.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/shipments/:id/status', () => {
  it('allows ADMIN to update shipment status', async () => {
    const user = await createTestUser({ email: 'ust@test.com', password: 'Test@1234' });
    const admin = await createTestAdmin({ email: 'ast@test.com', password: 'Test@1234' });
    const shipment = await createTestShipment({ userId: user.id });
    const token = await loginAndGetToken(app, admin.email, 'Test@1234');

    const res = await request(app)
      .patch(`/api/shipments/${shipment.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PICKED_UP', location: 'Sydney Depot', note: 'Picked up' });

    expect(res.status).toBe(200);
    expect(res.body.shipment.status).toBe('PICKED_UP');
  });

  it('returns 403 when a USER tries to update status', async () => {
    const user = await createTestUser({ email: 'usr2@test.com', password: 'Test@1234' });
    const shipment = await createTestShipment({ userId: user.id });
    const token = await loginAndGetToken(app, user.email, 'Test@1234');

    const res = await request(app)
      .patch(`/api/shipments/${shipment.id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'PICKED_UP' });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/shipments/track/:trackingNumber', () => {
  it('returns shipment for a valid tracking number (public endpoint)', async () => {
    const user = await createTestUser({ email: 'trk@test.com', password: 'Test@1234' });
    const shipment = await createTestShipment({ userId: user.id, trackingNumber: 'CS-TRACK123' });

    const res = await request(app).get(`/api/shipments/track/${shipment.trackingNumber}`);

    expect(res.status).toBe(200);
    expect(res.body.shipment.trackingNumber).toBe(shipment.trackingNumber);
  });

  it('returns 404 for unknown tracking number', async () => {
    const res = await request(app).get('/api/shipments/track/CS-XXXXXXXX');
    expect(res.status).toBe(404);
  });
});
