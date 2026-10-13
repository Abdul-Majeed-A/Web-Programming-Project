import express from 'express';
import { getAssignments, assignFaculty, removeAssignment } from '../controllers/assignmentController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getAssignments);
router.post('/', authorize('admin'), assignFaculty);
router.delete('/:id', authorize('admin'), removeAssignment);

export default router;
