import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || 'projectpulse_super_secret_jwt_key_2026_academic_system',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res, next) => {
  try {
    const { full_name, email, password, department, student_or_faculty_identifier } = req.body;

    // Check if email already registered
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Public registration is restricted to 'student' role only for security
    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, password_hash, role, department, student_or_faculty_identifier, account_status)
       VALUES (?, ?, ?, 'student', ?, ?, 'active')`,
      [full_name, email, passwordHash, department, student_or_faculty_identifier]
    );

    const newUser = {
      id: result.insertId,
      full_name,
      email,
      role: 'student',
      department,
      student_or_faculty_identifier,
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.execute(
      'SELECT id, full_name, email, password_hash, role, department, student_or_faculty_identifier, account_status FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = users[0];

    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your system administrator.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  return res.status(200).json({ success: true, message: 'Logged out successfully.' });
};
