import express from 'express';
import { AdminController } from '../controller/admin.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const adminController = new AdminController();

router.use(authenticate);


router.post('/', adminController.createUser);


router.get('/users', adminController.getUsers);

router.post('/teams', adminController.createTeam);
router.get('/teams', adminController.getTeams);
router.get('/teams/:id', adminController.getTeamById);
router.put('/teams/:id', adminController.updateTeam);
router.delete('/teams/:id', adminController.deleteTeam);
// Add these routes to your existing admin routes
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Team member management
router.post('/teams/:teamId/members', adminController.addTeamMember);
router.delete('/teams/:teamId/members/:memberId', adminController.removeTeamMember);



export default router;