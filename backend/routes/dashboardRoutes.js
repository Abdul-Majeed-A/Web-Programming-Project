import express from 'express';
import { getStudentDashboard, getFacultyDashboard, getAdminDashboard } from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/student', authorize('student'), getStudentDashboard);
router.get('/faculty', authorize('faculty'), getFacultyDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);

export default router;
