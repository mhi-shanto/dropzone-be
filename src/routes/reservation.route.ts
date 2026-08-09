import { Router } from 'express';
import * as reservationController from '../controllers/reservation.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { reserveDropParamSchema } from '../validations/reservation.validation';

const router = Router();

router.post(
  '/:dropId/reserve',
  authenticate,
  validate(reserveDropParamSchema, 'params'),
  reservationController.reserve
);

export default router;
