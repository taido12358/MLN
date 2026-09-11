import type { NextFunction, Request, Response } from "express";

/**
 * Express 4 does NOT catch a rejected promise from an async route handler — an unhandled rejection
 * that far up the stack is treated as an uncaught exception by Node (default since Node 15), which
 * crashes the whole process and disconnects every one of the ~70 students mid-class. Wrap every
 * async route with this so a thrown/rejected error is forwarded to Express's error middleware
 * (see the catch-all in index.ts) instead of escaping unhandled.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
