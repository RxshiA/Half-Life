import { Request, Response, NextFunction } from 'express';

// ---- mock the service ----
const mockRegister = jest.fn();
const mockLogin = jest.fn();
const mockGetMe = jest.fn();

jest.mock('../auth.service', () => ({
  register: (...a: unknown[]) => mockRegister(...a),
  login: (...a: unknown[]) => mockLogin(...a),
  getMe: (...a: unknown[]) => mockGetMe(...a),
}));

import { register, login, me } from '../auth.controller';

const makeRes = () => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};
const next: NextFunction = jest.fn();

const publicUser = { id: 'u1', email: 'a@b.com', role: 'USER' };

describe('authController.register', () => {
  it('responds 201 with user and token on success', async () => {
    mockRegister.mockResolvedValue({ user: publicUser, token: 'tok' });
    const req = { validatedBody: { email: 'a@b.com', password: 'Pw1', fullName: 'A' } } as Request;
    const res = makeRes();

    await (register as Function)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ user: publicUser, token: 'tok' });
  });

  it('forwards errors to next()', async () => {
    const err = new Error('boom');
    mockRegister.mockRejectedValue(err);
    const req = { validatedBody: {} } as Request;
    const res = makeRes();

    await (register as Function)(req, res, next);
    // asyncHandler returns the inner promise so awaiting it flushes the catch handler.
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe('authController.login', () => {
  it('responds 200 with user and token', async () => {
    mockLogin.mockResolvedValue({ user: publicUser, token: 'tok' });
    const req = { validatedBody: { email: 'a@b.com', password: 'pw' } } as Request;
    const res = makeRes();

    await (login as Function)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: publicUser, token: 'tok' });
  });
});

describe('authController.me', () => {
  it('responds 200 with the authenticated user', async () => {
    mockGetMe.mockResolvedValue(publicUser);
    const req = { user: { sub: 'u1', role: 'USER' } } as unknown as Request;
    const res = makeRes();

    await (me as Function)(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ user: publicUser });
  });
});
