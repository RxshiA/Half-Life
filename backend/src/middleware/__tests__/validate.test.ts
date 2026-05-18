import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validate } from '../validate';
import { AppError } from '../../errors/AppError';

const makeReq = (body: unknown): Partial<Request> => ({ body } as Partial<Request>);
const makeRes = (): Partial<Response> => ({} as Partial<Response>);

describe('validate middleware', () => {
  const schema = z.object({
    name: z.string().min(1),
    age: z.coerce.number().int().positive(),
  });

  it('calls next() without error when body matches schema', () => {
    const req = makeReq({ name: 'Alice', age: 30 }) as Request;
    const next = jest.fn() as NextFunction;
    validate(schema)(req, makeRes() as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('calls next(AppError) when body is invalid', () => {
    const req = makeReq({ name: '' }) as Request;
    const next = jest.fn() as NextFunction;
    validate(schema)(req, makeRes() as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    const err = (next as jest.Mock).mock.calls[0][0] as AppError;
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.status).toBe(400);
  });

  it('assigns parsed (coerced) data to req.validatedBody', () => {
    const req = makeReq({ name: 'Bob', age: '25' }) as Request;
    const next = jest.fn() as NextFunction;
    validate(schema)(req, makeRes() as Response, next);
    expect((req.validatedBody as { age: number }).age).toBe(25);
  });

  it('validates query params when target is "query"', () => {
    const querySchema = z.object({ page: z.coerce.number().default(1) });
    const req = { query: { page: '2' } } as unknown as Request;
    const next = jest.fn() as NextFunction;
    validate(querySchema, 'query')(req, makeRes() as Response, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.validatedQuery).toEqual({ page: 2 });
  });
});
