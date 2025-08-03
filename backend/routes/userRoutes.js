import { Router } from "express";
import * as userController from '../controllers/userController.js';
import { body } from 'express-validator';

const router = Router();

router.post('/register', userController.createUserController);
router.post('/login', userController.loginUserController);

export default router;