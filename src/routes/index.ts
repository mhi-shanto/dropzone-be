import { Router } from 'express';
import authRouter from './auth.route';
import dropRouter from './drop.route';
import healthRouter from './health.route';
import purchaseRouter from './purchase.route';
import reservationRouter from './reservation.route';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/drops', dropRouter);
router.use('/drops', reservationRouter);
router.use('/reservations', purchaseRouter);

export default router;
