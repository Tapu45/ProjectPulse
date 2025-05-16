import express from 'express';
import { projectController } from '../controller/project.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate);
router.get('/', projectController.getAllProjects);
router.get('/:id', projectController.getProjectById);
router.get('/stats/overview', projectController.getProjectStats);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

export default router;