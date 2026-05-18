import { Request, Response, NextFunction } from 'express';

const mockCreateShipment = jest.fn();
const mockListShipments = jest.fn();
const mockGetShipment = jest.fn();
const mockUpdateShipmentStatus = jest.fn();
const mockTrackShipment = jest.fn();

jest.mock('../shipments.service', () => ({
  createShipment: (...a: unknown[]) => mockCreateShipment(...a),
  listShipments: (...a: unknown[]) => mockListShipments(...a),
  getShipment: (...a: unknown[]) => mockGetShipment(...a),
  updateShipmentStatus: (...a: unknown[]) => mockUpdateShipmentStatus(...a),
  trackShipment: (...a: unknown[]) => mockTrackShipment(...a),
}));

import {
  createShipment,
  listShipments,
  getShipment,
  updateShipmentStatus,
  trackShipment,
} from '../shipments.controller';

const next: NextFunction = jest.fn();

const makeRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
}) as unknown as Response;

const fakeShipment = { id: 's1', trackingNumber: 'CS-ABCD1234' };

describe('shipmentsController.createShipment', () => {
  it('responds 201 with the created shipment', async () => {
    mockCreateShipment.mockResolvedValue(fakeShipment);
    const req = { user: { sub: 'u1', role: 'USER' }, validatedBody: {} } as unknown as Request;
    const res = makeRes();
    await (createShipment as Function)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ shipment: fakeShipment });
  });

  it('forwards errors to next()', async () => {
    const err = new Error('fail');
    mockCreateShipment.mockRejectedValue(err);
    const req = { user: { sub: 'u1', role: 'USER' }, validatedBody: {} } as unknown as Request;
    await (createShipment as Function)(req, makeRes(), next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe('shipmentsController.listShipments', () => {
  it('responds 200 with paginated result', async () => {
    const result = { shipments: [fakeShipment], total: 1, page: 1, limit: 20 };
    mockListShipments.mockResolvedValue(result);
    const req = {
      user: { sub: 'u1', role: 'USER' },
      validatedQuery: { page: 1, limit: 20 },
    } as unknown as Request;
    const res = makeRes();
    await (listShipments as Function)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(result);
  });
});

describe('shipmentsController.getShipment', () => {
  it('responds 200 with the shipment', async () => {
    mockGetShipment.mockResolvedValue(fakeShipment);
    const req = {
      user: { sub: 'u1', role: 'USER' },
      params: { id: 's1' },
    } as unknown as Request;
    const res = makeRes();
    await (getShipment as Function)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ shipment: fakeShipment });
  });
});

describe('shipmentsController.updateShipmentStatus', () => {
  it('responds 200 with the updated shipment', async () => {
    const updated = { ...fakeShipment, status: 'PICKED_UP' };
    mockUpdateShipmentStatus.mockResolvedValue(updated);
    const req = {
      user: { sub: 'a1', role: 'ADMIN' },
      params: { id: 's1' },
      validatedBody: { status: 'PICKED_UP' },
    } as unknown as Request;
    const res = makeRes();
    await (updateShipmentStatus as Function)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

describe('shipmentsController.trackShipment', () => {
  it('responds 200 with the tracked shipment', async () => {
    mockTrackShipment.mockResolvedValue(fakeShipment);
    const req = { params: { trackingNumber: 'CS-ABCD1234' } } as unknown as Request;
    const res = makeRes();
    await (trackShipment as Function)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ shipment: fakeShipment });
  });
});
