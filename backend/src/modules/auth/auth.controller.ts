import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import * as authService from './auth.service';
import { RegisterInput, LoginInput } from './auth.schemas';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.validatedBody as RegisterInput);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.validatedBody as LoginInput);
  res.status(200).json(result);
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.sub);
  res.status(200).json({ user });
});
