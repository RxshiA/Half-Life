import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import * as usersService from './users.service';
import { UpdateProfileInput } from './users.schemas';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getProfile(req.user!.sub);
  res.status(200).json({ user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateProfile(req.user!.sub, req.validatedBody as UpdateProfileInput);
  res.status(200).json({ user });
});
