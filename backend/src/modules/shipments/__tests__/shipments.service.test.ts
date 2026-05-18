import { AppError } from '../../../errors/AppError';

const mockUserFindUnique = jest.fn();
const mockShipmentFindUnique = jest.fn();
const mockShipmentFindMany = jest.fn();
const mockShipmentCount = jest.fn();
const mockShipmentCreate = jest.fn();
const mockShipmentUpdate = jest.fn();
const mockEventCreate = jest.fn();
const mockTransaction = jest.fn();

jest.mock('../../../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: (...a: unknown[]) => mockUserFindUnique(...a) },
    shipment: {
      findUnique: (...a: unknown[]) => mockShipmentFindUnique(...a),
      findMany: (...a: unknown[]) => mockShipmentFindMany(...a),
      count: (...a: unknown[]) => mockShipmentCount(...a),
      create: (...a: unknown[]) => mockShipmentCreate(...a),
      update: (...a: unknown[]) => mockShipmentUpdate(...a),
    },
    shipmentEvent: { create: (...a: unknown[]) => mockEventCreate(...a) },
    $transaction: (...a: unknown[]) => mockTransaction(...a),
  },
}));

jest.mock('../../../lib/tracking', () => ({
  generateTrackingNumber: jest.fn().mockReturnValue('CS-ABCD1234'),
}));

import {
  createShipment,
  listShipments,
  getShipment,
  updateShipmentStatus,
  trackShipment,
} from '../shipments.service';

const baseUser = {
  id: 'u1',
  fullName: 'Test User',
  addressLine1: '1 St',
  addressLine2: null,
  city: 'Sydney',
  state: 'NSW',
  postalCode: '2000',
};

const baseShipment = {
  id: 's1',
  trackingNumber: 'CS-ABCD1234',
  userId: 'u1',
  senderName: 'Test User',
  senderAddress: '1 St, Sydney NSW 2000',
  recipientName: 'Recipient',
  recipientAddress: '2 Rd',
  recipientPhone: '+61',
  weightKg: { toString: () => '1.5' },
  declaredValue: null,
  dimensionsCm: '30x20x10',
  packageType: 'PARCEL',
  serviceLevel: 'STANDARD',
  status: 'PENDING',
  notes: null,
  estimatedDelivery: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('shipmentsService.createShipment', () => {
  const input = {
    recipientName: 'Recipient',
    recipientAddress: '2 Rd',
    recipientPhone: '+61400000099',
    weightKg: 1.5,
    dimensionsCm: '30x20x10',
    packageType: 'PARCEL' as const,
    serviceLevel: 'STANDARD' as const,
  };

  it('creates and returns a serialized shipment', async () => {
    mockUserFindUnique.mockResolvedValue(baseUser);
    mockShipmentFindUnique.mockResolvedValue(null);
    mockShipmentCreate.mockResolvedValue(baseShipment);
    mockEventCreate.mockResolvedValue({});

    const result = await createShipment('u1', input);
    expect(result.trackingNumber).toBe('CS-ABCD1234');
    expect(result.weightKg).toBe('1.5');
  });

  it('throws 404 when user does not exist', async () => {
    mockUserFindUnique.mockResolvedValue(null);
    await expect(createShipment('ghost', input)).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });
});

describe('shipmentsService.listShipments', () => {
  it('returns paginated list for USER (own shipments only)', async () => {
    mockTransaction.mockResolvedValue([[baseShipment], 1]);
    const result = await listShipments('u1', 'USER', { page: 1, limit: 20 });
    expect(result.total).toBe(1);
    expect(result.shipments).toHaveLength(1);
  });

  it('returns all shipments for ADMIN', async () => {
    mockTransaction.mockResolvedValue([[baseShipment], 1]);
    const result = await listShipments('a1', 'ADMIN', { page: 1, limit: 20 });
    expect(result.total).toBe(1);
  });
});

describe('shipmentsService.getShipment', () => {
  it('returns shipment with events for owner', async () => {
    mockShipmentFindUnique.mockResolvedValue({ ...baseShipment, events: [] });
    const result = await getShipment('s1', 'u1', 'USER');
    expect(result.id).toBe('s1');
  });

  it('throws 403 when USER tries to access another user shipment', async () => {
    mockShipmentFindUnique.mockResolvedValue({ ...baseShipment, events: [] });
    await expect(getShipment('s1', 'other-user', 'USER')).rejects.toMatchObject({
      code: 'FORBIDDEN',
      status: 403,
    });
  });

  it('throws 404 when shipment not found', async () => {
    mockShipmentFindUnique.mockResolvedValue(null);
    await expect(getShipment('ghost', 'u1', 'USER')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('allows ADMIN to view any shipment', async () => {
    mockShipmentFindUnique.mockResolvedValue({ ...baseShipment, events: [] });
    const result = await getShipment('s1', 'admin1', 'ADMIN');
    expect(result.id).toBe('s1');
  });
});

describe('shipmentsService.updateShipmentStatus', () => {
  it('updates status and returns updated shipment', async () => {
    mockShipmentFindUnique
      .mockResolvedValueOnce(baseShipment)
      .mockResolvedValueOnce({ ...baseShipment, status: 'PICKED_UP', events: [] });
    mockTransaction.mockResolvedValue([{ ...baseShipment, status: 'PICKED_UP' }, {}]);

    const result = await updateShipmentStatus('s1', 'admin1', {
      status: 'PICKED_UP',
      location: 'Sydney Depot',
    });
    expect(result.status).toBe('PICKED_UP');
  });

  it('throws 404 when shipment not found', async () => {
    mockShipmentFindUnique.mockResolvedValue(null);
    await expect(
      updateShipmentStatus('ghost', 'admin1', { status: 'PICKED_UP' }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});

describe('shipmentsService.trackShipment', () => {
  it('returns shipment with events for a valid tracking number', async () => {
    mockShipmentFindUnique.mockResolvedValue({ ...baseShipment, events: [] });
    const result = await trackShipment('CS-ABCD1234');
    expect(result.trackingNumber).toBe('CS-ABCD1234');
  });

  it('throws 404 for unknown tracking number', async () => {
    mockShipmentFindUnique.mockResolvedValue(null);
    await expect(trackShipment('CS-UNKNOWN1')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      status: 404,
    });
  });
});
