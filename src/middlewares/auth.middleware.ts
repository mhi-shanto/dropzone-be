import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import {
  AUTH_ERRORS,
  AUTH_HEADER,
  BEARER_PREFIX,
} from '../constants/auth.constants';
import { AuthTokenPayload } from '../types/express';

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers[AUTH_HEADER];

  if (typeof authHeader !== 'string' || !authHeader.startsWith(BEARER_PREFIX)) {
    res.status(401).json({ error: AUTH_ERRORS.MISSING_TOKEN });
    return;
  }

  const token = authHeader.slice(BEARER_PREFIX.length);

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: AUTH_ERRORS.INVALID_TOKEN });
  }
}
