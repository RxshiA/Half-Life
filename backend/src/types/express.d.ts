import { JwtPayload } from '../lib/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      /** Set by `validate()` after successful body parsing (Express 5+ `req.body` is not always assignable). */
      validatedBody?: unknown;
      /** Set by `validate(..., 'query')` — do not assign onto `req.query` (read-only in Express 5). */
      validatedQuery?: unknown;
      /** Set by `validate(..., 'params')` if used — `req.params` can be read-only in Express 5. */
      validatedParams?: unknown;
    }
  }
}
