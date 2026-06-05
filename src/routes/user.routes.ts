import { changeUserPreferences, getUserPreferences } from '../controllers/user.controller';
import express from 'express';
import { validateParams } from '../middleware/userValidations.middleware';
import { updatePreferenceSchema, userIdParamsSchema } from '../schemas/preferences.schemas';

const router = express.Router();

router.get('/:id/preferences', validateParams(userIdParamsSchema), getUserPreferences);
router.post('/:id/preferences', validateParams(updatePreferenceSchema), changeUserPreferences);

export default router;
