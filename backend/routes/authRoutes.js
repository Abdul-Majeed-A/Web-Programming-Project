import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { registerValidator, loginValidator } from '../validators/authValidator.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

router.post('/register', registerValidator, validateRequest, register);
router.post('/login', loginValidator, validateRequest, login);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

export default router;
