import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../errors/AppError';

export type ValidateTarget = 'body' | 'query' | 'params';

export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(
        new AppError('VALIDATION_ERROR', 'Validation failed', 400, result.error.issues),
      );
    }
    if (target === 'body') {
      req.validatedBody = result.data;
    } else if (target === 'query') {
      req.validatedQuery = result.data;
    } else {
      req.validatedParams = result.data;
    }
    next();
  };
}
