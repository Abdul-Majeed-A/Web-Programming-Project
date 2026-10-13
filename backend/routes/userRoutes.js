import express from 'express';
import { getStudents, getFaculty, createUser, toggleUserStatus, updateProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

// Student listing (students can view to add team members, admin can manage)
router.get('/students', getStudents);

// Faculty listing (admin assigns, students/faculty can view)
router.get('/faculty', getFaculty);

// Admin user management
router.post('/', authorize('admin'), createUser);
router.put('/:id/status', authorize('admin'), toggleUserStatus);

// Profile
router.put('/profile', updateProfile);

export default router;
