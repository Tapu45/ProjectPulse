import express from 'express';
import { adminController } from '../controller/assignment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();


router.use(authenticate);

// Assign a complaint to a staff member
router.post('/assign', adminController.assignComplaint);

// Get list of staff members who can be assigned to complaints
router.get('/assignable-staff', adminController.getAssignableStaff);

// Balance workload by distributing unassigned complaints
router.post('/balance-workload', adminController.balanceWorkload);

// Uncomment when the controller method is implemented
// Get assignment history for a specific complaint
// router.get('/history/:complaintId', adminController.getAssignmentHistory);

export default router;