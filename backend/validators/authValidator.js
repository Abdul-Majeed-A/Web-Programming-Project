import { body } from 'express-validator';

export const registerValidator = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 150 })
    .withMessage('Name must be between 2 and 150 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required.'),
  body('student_or_faculty_identifier')
    .trim()
    .notEmpty()
    .withMessage('Student ID / Roll number is required.'),
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];
