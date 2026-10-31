import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { isValidUUID } from '../utils/security.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = result.error as ZodError;
      return res.status(400).json({
        error: 'Validation Error',
        code: 'VALIDATION_FAILED',
        details: err.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

export function validateIdParam(paramName: string = 'id') {
  return (req: Request, res: Response, next: NextFunction) => {
    const rawId = req.params[paramName];
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!id || !isValidUUID(id)) {
      return res.status(400).json({
        error: `Invalid resource identifier format for '${paramName}'`,
        code: 'INVALID_ID_FORMAT',
      });
    }
    next();
  };
}
