import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorHandler } from '../errorHandler';
import { AppError } from '../../errors/AppError';

const makeRes = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as Response;
};
const makeReq = (): Request => ({} as Request);
const next: NextFunction = jest.fn();

describe('errorHandler middleware', () => {
  it('handles AppError correctly', () => {
    const res = makeRes();
    const err = new AppError('TEST_CODE', 'Test message', 422, { field: 'x' });
    errorHandler(err, makeReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: { code: 'TEST_CODE', message: 'Test message', details: { field: 'x' } },
    });
  });

  it('handles AppError without details', () => {
    const res = makeRes();
    const err = new AppError('SIMPLE', 'Simple error', 400);
    errorHandler(err, makeReq(), res, next);
    const body = (res.json as jest.Mock).mock.calls[0][0];
    expect(body.error.details).toBeUndefined();
  });

  it('handles ZodError as 400 VALIDATION_ERROR', () => {
    const res = makeRes();
    // Parse a deliberately failing schema to produce a real ZodError in v4 format.
    const { z } = require('zod');
    const schema = z.object({ name: z.string().min(5) });
    const parseResult = schema.safeParse({ name: '' });
    const err = parseResult.error!;
    errorHandler(err, makeReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect((res.json as jest.Mock).mock.calls[0][0].error.code).toBe('VALIDATION_ERROR');
  });

  it('handles Prisma P2002 as 409 CONFLICT', () => {
    const res = makeRes();
    const err = { code: 'P2002', message: 'Unique constraint failed', meta: {} };
    errorHandler(err, makeReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect((res.json as jest.Mock).mock.calls[0][0].error.code).toBe('CONFLICT');
  });

  it('handles Prisma P2025 as 404 NOT_FOUND', () => {
    const res = makeRes();
    const err = { code: 'P2025', message: 'Record not found' };
    errorHandler(err, makeReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect((res.json as jest.Mock).mock.calls[0][0].error.code).toBe('NOT_FOUND');
  });

  it('handles unknown errors as 500', () => {
    const res = makeRes();
    errorHandler(new Error('boom'), makeReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect((res.json as jest.Mock).mock.calls[0][0].error.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
