import { Router } from 'express';
import { ingestProject } from '../controllers/project.controller.js';
import validate from '../middleware/validation.middleware.js';
import { ingestProjectRequestSchema } from '../validations/project.validation.js';

const router = Router();

router.post('/', validate(ingestProjectRequestSchema), ingestProject);

export default router;
