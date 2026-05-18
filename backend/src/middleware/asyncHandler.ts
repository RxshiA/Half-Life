import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps an async route handler so that any rejected promise is forwarded to
 * Express's error handler via next(err). Express 5 does this automatically for
 * async functions, but this wrapper preserves explicit intent and ensures
 * compatibility with all middleware patterns.
 */
export function asyncHandler(fn: AsyncFn): RequestHandler {
  return (req, res, next) => {
    // Return the promise so callers (and tests) can await settlement.
    return fn(req, res, next).catch(next) as unknown as void;
  };
}
