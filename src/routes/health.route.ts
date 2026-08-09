import { Router, Request, Response } from 'express';
import { sequelize } from '../config/db';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const timestamp = new Date().toISOString();

  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'ok',
      timestamp,
      db: 'connected',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Database ping failed';
    res.status(503).json({
      status: 'degraded',
      timestamp,
      db: 'disconnected',
      error: errorMessage,
    });
  }
});

export default router;
