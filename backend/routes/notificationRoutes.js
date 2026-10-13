import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  broadcastNotification,
} from '../controllers/notificationController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);
router.post('/broadcast', authorize('admin'), broadcastNotification);

export default router;
