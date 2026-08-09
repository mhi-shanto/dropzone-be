import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import {
  createDrop,
  getDropById,
  listDrops,
} from '../services/drop.service';
import {
  CreateDropInput,
  DropIdParam,
} from '../validations/drop.validation';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = req.body as CreateDropInput;
  const drop = await createDrop(input);
  res.status(201).json({ drop });
});

export const list = asyncHandler(async (_req: Request, res: Response) => {
  const drops = await listDrops();
  res.status(200).json({ drops });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as DropIdParam;
  const drop = await getDropById(id);
  res.status(200).json({ drop });
});
