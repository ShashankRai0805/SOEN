import { Router } from "express";
import * as userController from '../controllers/userController.js';
import { body } from 'express-validator';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register', userController.createUserController);
router.post('/login', userController.loginUserController);
router.get('/profile', authMiddleware.authUser, userController.profileController);
router.get('/logout', authMiddleware.authUser, userController.logoutController);
router.get("/all", authMiddleware.authUser, userController.getAllUsersController);

export default router;