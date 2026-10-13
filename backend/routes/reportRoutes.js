import express from 'express';
import {
  getProjectReports,
  exportProjectReportsCSV,
  getEvaluationReports,
  exportEvaluationReportsCSV,
} from '../controllers/reportController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/projects', getProjectReports);
router.get('/projects/export', exportProjectReportsCSV);
router.get('/evaluations', getEvaluationReports);
router.get('/evaluations/export', exportEvaluationReportsCSV);

export default router;
