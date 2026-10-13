import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export const getStudents = async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    let queryStr = `
      SELECT id, full_name, email, department, student_or_faculty_identifier, account_status, created_at 
      FROM users 
      WHERE role = 'student'
    `;
    const params = [];

    if (search) {
      queryStr += ` AND (full_name LIKE ? OR email LIKE ? OR student_or_faculty_identifier LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (department) {
      queryStr += ` AND department = ?`;
      params.push(department);
    }
    if (status) {
      queryStr += ` AND account_status = ?`;
      params.push(status);
    }

    queryStr += ` ORDER BY created_at DESC`;
    const [students] = await pool.execute(queryStr, params);

    return res.status(200).json({ success: true, data: students });
  } catch (error) {
    next(error);
  }
};

export const getFaculty = async (req, res, next) => {
  try {
    const { search, department, status } = req.query;
    let queryStr = `
      SELECT u.id, u.full_name, u.email, u.department, u.student_or_faculty_identifier, u.account_status, u.created_at,
             COUNT(DISTINCT pa.project_id) as assigned_project_count
      FROM users u
      LEFT JOIN project_assignments pa ON u.id = pa.faculty_id
      WHERE u.role = 'faculty'
    `;
    const params = [];

    if (search) {
      queryStr += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.student_or_faculty_identifier LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (department) {
      queryStr += ` AND u.department = ?`;
      params.push(department);
    }
    if (status) {
      queryStr += ` AND u.account_status = ?`;
      params.push(status);
    }

    queryStr += ` GROUP BY u.id ORDER BY u.created_at DESC`;
    const [faculty] = await pool.execute(queryStr, params);

    return res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { full_name, email, password, role, department, student_or_faculty_identifier } = req.body;

    if (!['student', 'faculty', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password || 'ProjectPulse@123', saltRounds);

    const [result] = await pool.execute(
      `INSERT INTO users (full_name, email, password_hash, role, department, student_or_faculty_identifier, account_status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [full_name, email, passwordHash, role, department, student_or_faculty_identifier]
    );

    return res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully.`,
      user: {
        id: result.insertId,
        full_name,
        email,
        role,
        department,
        student_or_faculty_identifier,
        account_status: 'active',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid account status. Must be active or inactive.' });
    }

    // Prevent deactivating own admin account
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }

    await pool.execute('UPDATE users SET account_status = ? WHERE id = ?', [status, id]);

    return res.status(200).json({
      success: true,
      message: `Account status updated to ${status}.`,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, department, student_or_faculty_identifier, new_password } = req.body;
    const userId = req.user.id;

    if (new_password) {
      const passwordHash = await bcrypt.hash(new_password, 10);
      await pool.execute(
        `UPDATE users SET full_name = ?, department = ?, student_or_faculty_identifier = ?, password_hash = ? WHERE id = ?`,
        [full_name || req.user.full_name, department || req.user.department, student_or_faculty_identifier || req.user.student_or_faculty_identifier, passwordHash, userId]
      );
    } else {
      await pool.execute(
        `UPDATE users SET full_name = ?, department = ?, student_or_faculty_identifier = ? WHERE id = ?`,
        [full_name || req.user.full_name, department || req.user.department, student_or_faculty_identifier || req.user.student_or_faculty_identifier, userId]
      );
    }

    const [updated] = await pool.execute('SELECT id, full_name, email, role, department, student_or_faculty_identifier FROM users WHERE id = ?', [userId]);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated[0],
    });
  } catch (error) {
    next(error);
  }
};
