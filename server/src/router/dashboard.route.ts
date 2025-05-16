import express from 'express';
import { dashboardController } from '../controller/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/stats', authenticate, dashboardController.getDashboardStats);
router.get('/category-stats', authenticate, dashboardController.getCategoryStats);
router.get('/status-stats', authenticate, dashboardController.getStatusStats);
router.get('/priority-stats', authenticate, dashboardController.getPriorityStats);
router.get('/complaints-trend', authenticate, dashboardController.getComplaintsTrend);
router.get('/project-stats', authenticate, dashboardController.getProjectStats);
router.get('/resolution-time', authenticate, dashboardController.getResolutionTimeStats);
router.get('/workload', authenticate, dashboardController.getWorkloadDistribution);

export default router;