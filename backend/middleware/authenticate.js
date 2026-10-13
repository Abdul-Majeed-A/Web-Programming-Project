import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'projectpulse_super_secret_jwt_key_2026_academic_system');
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    }

    // Fetch user details from DB to ensure account is active
    const [users] = await pool.execute(
      'SELECT id, full_name, email, role, department, student_or_faculty_identifier, account_status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'User account not found.' });
    }

    const user = users[0];
    if (user.account_status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
};
