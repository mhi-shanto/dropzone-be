import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';

type RequestSource = 'body' | 'query' | 'params';

export function validate(schema: ZodType, source: RequestSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    req[source] = result.data;
    next();
  };
}
