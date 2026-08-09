import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { completePurchase as completePurchaseService } from '../services/purchase.service';
import { PurchaseParams } from '../validations/purchase.validation';

export const completePurchase = asyncHandler(
  async (req: Request, res: Response) => {
    const { reservationId } = req.params as PurchaseParams;
    const userId = req.user!.sub;
    const { purchase } = await completePurchaseService(reservationId, userId);
    res.status(201).json({ purchase });
  }
);
