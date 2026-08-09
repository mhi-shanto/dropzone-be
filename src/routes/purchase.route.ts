import { Router } from 'express';
import * as purchaseController from '../controllers/purchase.controller';
import * as reservationController from '../controllers/reservation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { purchaseParamsSchema } from '../validations/purchase.validation';

const router = Router();

router.get('/active', authenticate, reservationController.listActive);

router.post(
  '/:reservationId/purchase',
  authenticate,
  validate(purchaseParamsSchema, 'params'),
  purchaseController.completePurchase
);

export default router;
