import express from 'express';
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getSchedules);
router.post('/', authorize('admin'), createSchedule);
router.put('/:id', authorize('admin'), updateSchedule);
router.delete('/:id', authorize('admin'), deleteSchedule);

export default router;
