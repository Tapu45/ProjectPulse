import express from 'express';
import authController from '../controller/auth.controller';
import { authenticate } from '../middleware/auth.middleware';


const router = express.Router();

router.post('/login', authController.login);

router.post('/register', authController.register);

router.get('/me',authenticate,authController.getCurrentUser);

router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);


export default router;