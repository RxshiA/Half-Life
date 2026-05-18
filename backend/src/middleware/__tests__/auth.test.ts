import { Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../auth';
import { AppError } from '../../errors/AppError';
import { signAccessToken } from '../../lib/jwt';

const makeReq = (headers: Record<string, string> = {}): Partial<Request> =>
  ({ headers } as unknown as Partial<Request>);
const makeRes = (): Partial<Response> => ({} as Partial<Response>);

describe('requireAuth middleware', () => {
  it('calls next(AppError 401) when no Authorization header', () => {
    const req = makeReq() as Request;
    const next = jest.fn() as NextFunction;
    requireAuth(req, makeRes() as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(((next as jest.Mock).mock.calls[0][0] as AppError).status).toBe(401);
  });

  it('calls next(AppError 401) when header does not start with Bearer', () => {
    const req = makeReq({ authorization: 'Basic abc123' }) as Request;
    const next = jest.fn() as NextFunction;
    requireAuth(req, makeRes() as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('calls next(AppError 401) for an invalid token', () => {
    const req = makeReq({ authorization: 'Bearer invalid.token' }) as Request;
    const next = jest.fn() as NextFunction;
    requireAuth(req, makeRes() as Response, next);
    expect(next).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('populates req.user and calls next() for a valid token', () => {
    const token = signAccessToken({ sub: 'u1', role: 'USER' });
    const req = makeReq({ authorization: `Bearer ${token}` }) as Request;
    const next = jest.fn() as NextFunction;
    requireAuth(req, makeRes() as Response, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user?.sub).toBe('u1');
    expect(req.user?.role).toBe('USER');
  });
});

describe('requireRole middleware', () => {
  it('calls next(AppError 401) when req.user is not set', () => {
    const req = { headers: {} } as Request;
    const next = jest.fn() as NextFunction;
    requireRole('ADMIN')(req, makeRes() as Response, next);
    expect(((next as jest.Mock).mock.calls[0][0] as AppError).status).toBe(401);
  });

  it('calls next(AppError 403) when user role does not match', () => {
    const req = { headers: {}, user: { sub: 'u1', role: 'USER' } } as unknown as Request;
    const next = jest.fn() as NextFunction;
    requireRole('ADMIN')(req, makeRes() as Response, next);
    expect(((next as jest.Mock).mock.calls[0][0] as AppError).status).toBe(403);
  });

  it('calls next() when user role matches', () => {
    const req = { headers: {}, user: { sub: 'u1', role: 'ADMIN' } } as unknown as Request;
    const next = jest.fn() as NextFunction;
    requireRole('ADMIN')(req, makeRes() as Response, next);
    expect(next).toHaveBeenCalledWith();
  });
});
