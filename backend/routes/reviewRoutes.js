import express from 'express';
import {
  getStages,
  getCriteriaByStage,
  getReviewById,
  getProjectReviews,
  saveDraftReview,
  submitReview,
  updateStageConfig,
} from '../controllers/reviewController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { reviewSubmissionValidator } from '../validators/reviewValidator.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(authenticate);

// Stages & criteria
router.get('/stages', getStages);
router.get('/criteria/:stageId', getCriteriaByStage);
router.put('/stages/:id', authorize('admin'), updateStageConfig);

// Project reviews
router.get('/project/:projectId', getProjectReviews);
router.get('/:id', getReviewById);

// Faculty review actions
router.post('/draft', authorize('faculty', 'admin'), saveDraftReview);
router.post('/submit', authorize('faculty', 'admin'), reviewSubmissionValidator, validateRequest, submitReview);

export default router;
