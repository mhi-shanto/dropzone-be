import { Router } from 'express';
import * as dropController from '../controllers/drop.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  createDropSchema,
  dropIdParamSchema,
} from '../validations/drop.validation';

const router = Router();

router.use(authenticate);

router.post('/', validate(createDropSchema), dropController.create);
router.get('/', dropController.list);
router.get('/:id', validate(dropIdParamSchema, 'params'), dropController.getById);

export default router;
