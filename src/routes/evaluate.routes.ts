import express from 'express';
import { evaluate } from '../controllers/evaluate.controller';
import { validateBody } from '../middleware/userValidations.middleware';
import { evaluateSchema } from '../schemas/evaluate.schemas';

const router = express.Router();

router.post('/', validateBody(evaluateSchema), evaluate);

export default router;
