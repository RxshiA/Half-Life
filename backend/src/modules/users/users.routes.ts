import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { requireAuth } from '../../middleware/auth';
import { updateProfileSchema } from './users.schemas';
import * as usersController from './users.controller';

const router = Router();

router.use(requireAuth);

router.get('/me', usersController.getProfile);
router.put('/me', validate(updateProfileSchema), usersController.updateProfile);

export default router;
