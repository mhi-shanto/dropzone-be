import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import {
  getActiveReservationsForUser,
  reserveDrop,
} from '../services/reservation.service';
import { ReserveDropParam } from '../validations/reservation.validation';

export const listActive = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.sub;
  const reservations = await getActiveReservationsForUser(userId);
  res.status(200).json({ reservations });
});

export const reserve = asyncHandler(async (req: Request, res: Response) => {
  const { dropId } = req.params as ReserveDropParam;
  const userId = req.user!.sub;
  const reservation = await reserveDrop(dropId, userId);
  res.status(201).json({ reservation });
});
