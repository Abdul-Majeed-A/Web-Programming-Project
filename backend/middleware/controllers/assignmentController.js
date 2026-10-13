import pool from '../config/database.js';
import { createNotification } from '../services/notificationService.js';

export const getAssignments = async (req, res, next) => {
  try {
    const { projectId, facultyId } = req.query;
    let queryStr = `
      SELECT pa.id, pa.project_id, pa.faculty_id, pa.assigned_at,
             p.title as project_title, p.status as project_status, p.category as project_category,
             u.full_name as faculty_name, u.email as faculty_email, u.department as faculty_department,
             adm.full_name as assigned_by_name
      FROM project_assignments pa
      JOIN projects p ON pa.project_id = p.id
      JOIN users u ON pa.faculty_id = u.id
      JOIN users adm ON pa.assigned_by = adm.id
      WHERE 1=1
    `;
    const params = [];

    if (projectId) {
      queryStr += ` AND pa.project_id = ?`;
      params.push(projectId);
    }
    if (facultyId) {
      queryStr += ` AND pa.faculty_id = ?`;
      params.push(facultyId);
    }

    queryStr += ` ORDER BY pa.assigned_at DESC`;
    const [assignments] = await pool.execute(queryStr, params);

    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

export const assignFaculty = async (req, res, next) => {
  try {
    const { project_id, faculty_id } = req.body;
    const adminId = req.user.id;

    if (!project_id || !faculty_id) {
      return res.status(400).json({ success: false, message: 'Project ID and Faculty ID are required.' });
    }

    // Verify project exists
    const [projects] = await pool.execute('SELECT id, title, status FROM projects WHERE id = ?', [project_id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Verify faculty exists
    const [faculty] = await pool.execute(
      "SELECT id, full_name, email FROM users WHERE id = ? AND role = 'faculty' AND account_status = 'active'",
      [faculty_id]
    );
    if (faculty.length === 0) {
      return res.status(404).json({ success: false, message: 'Active faculty member not found.' });
    }

    // Check duplicate
    const [existing] = await pool.execute(
      'SELECT id FROM project_assignments WHERE project_id = ? AND faculty_id = ?',
      [project_id, faculty_id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'This faculty member is already assigned to this project.' });
    }

    const [result] = await pool.execute(
      'INSERT INTO project_assignments (project_id, faculty_id, assigned_by) VALUES (?, ?, ?)',
      [project_id, faculty_id, adminId]
    );

    // If project was in Submitted status, advance status to 'Under Review'
    if (projects[0].status === 'Submitted') {
      await pool.execute("UPDATE projects SET status = 'Under Review' WHERE id = ?", [project_id]);
    }

    // Notify faculty
    await createNotification({
      userId: faculty_id,
      title: 'New Project Review Assignment',
      message: `You have been assigned as reviewer for "${projects[0].title}".`,
      notificationType: 'reviewer_assignment',
      link: `/faculty/assigned`,
    });

    return res.status(201).json({
      success: true,
      message: `Faculty ${faculty[0].full_name} assigned to project successfully.`,
      assignmentId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

export const removeAssignment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM project_assignments WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Faculty assignment removed successfully.' });
  } catch (error) {
    next(error);
  }
};
