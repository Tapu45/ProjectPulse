import express from 'express';
import { issueController } from '../controller/issue.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/user', authenticate, issueController.getUserComplaints);
router.get('/assigned', authenticate,issueController.getAssignedComplaints);
router.get('/stats', authenticate, issueController.getComplaintStats);

router.post('/', authenticate, ...issueController.createComplaint);
router.get('/:id', authenticate, issueController.getComplaintById);
router.put('/:id', authenticate, ...issueController.updateComplaint);
router.delete('/:id', authenticate, issueController.deleteComplaint);
router.get('/', authenticate, issueController.getAllComplaints);
router.post('/:id/respond-resolution',authenticate, issueController.respondToResolution);


router.put('/:id/resolve', authenticate, issueController.resolveComplaint);


export default router;