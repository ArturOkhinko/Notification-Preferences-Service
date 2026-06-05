import {
  changeUserPreferences,
  getUserPreferences,
} from '../controllers/user.controller';
import express from 'express';
import {
  validateBody,
  validateParams,
} from '../middleware/userValidations.middleware';
import {
  updatePreferencesSchema,
  userIdParamsSchema,
} from '../schemas/preferences.schemas';

const router = express.Router();

router.get(
  '/:id/preferences',
  validateParams(userIdParamsSchema),
  getUserPreferences,
);
router.post(
  '/:id/preferences',
  validateParams(userIdParamsSchema),
  validateBody(updatePreferencesSchema),
  changeUserPreferences,
);

export default router;
