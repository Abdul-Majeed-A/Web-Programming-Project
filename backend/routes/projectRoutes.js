import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  submitProject,
  addMember,
  removeMember,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { upload } from '../middleware/upload.js';
import { createProjectValidator, addMemberValidator } from '../validators/projectValidator.js';
import { validateRequest } from '../middleware/validateRequest.js';

const router = express.Router();

router.use(authenticate);

// Project list & details
router.get('/', getProjects);
router.get('/:id', getProjectById);

// Student create & edit project
router.post('/', authorize('student'), createProjectValidator, validateRequest, createProject);
router.put('/:id', authorize('student', 'admin'), updateProject);
router.post('/:id/submit', authorize('student'), submitProject);

// Team members
router.post('/:id/members', authorize('student', 'admin'), addMemberValidator, validateRequest, addMember);
router.delete('/:id/members/:memberId', authorize('student', 'admin'), removeMember);

// Documents
router.post('/:id/documents', authorize('student', 'admin'), upload.single('document'), uploadDocument);
router.get('/:id/documents/:docId/download', downloadDocument);
router.delete('/:id/documents/:docId', authorize('student', 'admin'), deleteDocument);

export default router;
