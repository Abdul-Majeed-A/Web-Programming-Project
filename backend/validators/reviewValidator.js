import { body } from 'express-validator';

export const reviewSubmissionValidator = [
  body('projectId')
    .isInt({ min: 1 })
    .withMessage('Valid project ID is required.'),
  body('stageId')
    .isInt({ min: 1 })
    .withMessage('Valid review stage ID is required.'),
  body('scores')
    .isArray({ min: 1 })
    .withMessage('Scores array is required with at least one criterion evaluated.'),
  body('scores.*.criterionId')
    .isInt({ min: 1 })
    .withMessage('Valid criterion ID is required for each score.'),
  body('scores.*.marksAwarded')
    .isFloat({ min: 0 })
    .withMessage('Marks awarded must be a non-negative number.'),
  body('decision')
    .isIn(['Approved', 'Changes Required', 'Rejected'])
    .withMessage('Review decision must be Approved, Changes Required, or Rejected.'),
  body('feedback')
    .trim()
    .notEmpty()
    .withMessage('Overall feedback is required.')
    .isLength({ min: 10 })
    .withMessage('Feedback must be at least 10 characters long.'),
];
