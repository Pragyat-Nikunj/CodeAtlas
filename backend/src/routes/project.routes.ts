import { Router } from 'express';
import { ingestProject } from '../controllers/project.controller.js';

const router = Router();

router.post('/', ingestProject);

export default router;
