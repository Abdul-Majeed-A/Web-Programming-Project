import { body } from 'express-validator';

export const createProjectValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required.')
    .isLength({ min: 5, max: 255 })
    .withMessage('Title must be between 5 and 255 characters.'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Project description is required.')
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters long.'),
  body('objectives')
    .trim()
    .notEmpty()
    .withMessage('Project objectives are required.')
    .isLength({ min: 10 })
    .withMessage('Objectives must be at least 10 characters long.'),
  body('technology_stack')
    .trim()
    .notEmpty()
    .withMessage('Technology stack is required.'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Project category is required.'),
];

export const addMemberValidator = [
  body('identifier_or_email')
    .trim()
    .notEmpty()
    .withMessage('Student ID, Roll number or Email is required.'),
  body('team_role')
    .optional()
    .trim(),
];
