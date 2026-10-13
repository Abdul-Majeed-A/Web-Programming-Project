import fs from 'fs';
import path from 'path';
import pool from '../config/database.js';
import { notifyAdmins, createNotification } from '../services/notificationService.js';

export const getProjects = async (req, res, next) => {
  try {
    const { status, stage, category, search } = req.query;
    const { role, id: userId } = req.user;

    let queryStr = `
      SELECT p.*, 
             rs.stage_name, rs.stage_order,
             u.full_name as creator_name, u.email as creator_email,
             (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count,
             (SELECT GROUP_CONCAT(fac.full_name SEPARATOR ', ') 
              FROM project_assignments pa 
              JOIN users fac ON pa.faculty_id = fac.id 
              WHERE pa.project_id = p.id) as assigned_faculty_names
      FROM projects p
      JOIN users u ON p.created_by = u.id
      JOIN review_stages rs ON p.current_stage_id = rs.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based restrictions
    if (role === 'student') {
      queryStr += ` AND (p.created_by = ? OR p.id IN (SELECT project_id FROM project_members WHERE student_id = ?))`;
      params.push(userId, userId);
    } else if (role === 'faculty') {
      queryStr += ` AND p.id IN (SELECT project_id FROM project_assignments WHERE faculty_id = ?)`;
      params.push(userId);
    }

    // Filters
    if (status) {
      queryStr += ` AND p.status = ?`;
      params.push(status);
    }
    if (stage) {
      queryStr += ` AND p.current_stage_id = ?`;
      params.push(stage);
    }
    if (category) {
      queryStr += ` AND p.category = ?`;
      params.push(category);
    }
    if (search) {
      queryStr += ` AND (p.title LIKE ? OR p.technology_stack LIKE ? OR u.full_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    queryStr += ` ORDER BY p.updated_at DESC`;
    const [projects] = await pool.execute(queryStr, params);

    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;

    // Fetch basic project details
    const [projects] = await pool.execute(
      `SELECT p.*, rs.stage_name, rs.stage_order, rs.weightage as current_stage_weightage,
              u.full_name as creator_name, u.email as creator_email, u.department as creator_department
       FROM projects p
       JOIN users u ON p.created_by = u.id
       JOIN review_stages rs ON p.current_stage_id = rs.id
       WHERE p.id = ?`,
      [id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = projects[0];

    // Access control check
    if (role === 'student') {
      const [membership] = await pool.execute(
        `SELECT id FROM project_members WHERE project_id = ? AND student_id = ?`,
        [id, userId]
      );
      if (project.created_by !== userId && membership.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this project.' });
      }
    } else if (role === 'faculty') {
      const [assignment] = await pool.execute(
        `SELECT id FROM project_assignments WHERE project_id = ? AND faculty_id = ?`,
        [id, userId]
      );
      if (assignment.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not assigned to evaluate this project.' });
      }
    }

    // Fetch team members
    const [members] = await pool.execute(
      `SELECT pm.id as member_id, pm.team_role, pm.added_at,
              u.id as user_id, u.full_name, u.email, u.student_or_faculty_identifier, u.department
       FROM project_members pm
       JOIN users u ON pm.student_id = u.id
       WHERE pm.project_id = ?
       ORDER BY pm.added_at ASC`,
      [id]
    );

    // Fetch assigned reviewers
    const [assignments] = await pool.execute(
      `SELECT pa.id as assignment_id, pa.assigned_at,
              u.id as faculty_id, u.full_name, u.email, u.department, u.student_or_faculty_identifier
       FROM project_assignments pa
       JOIN users u ON pa.faculty_id = u.id
       WHERE pa.project_id = ?`,
      [id]
    );

    // Fetch documents
    const [documents] = await pool.execute(
      `SELECT pd.id, pd.original_filename, pd.stored_filename, pd.file_size, pd.mime_type, 
              pd.document_type, pd.uploaded_at, u.full_name as uploader_name
       FROM project_documents pd
       JOIN users u ON pd.uploaded_by = u.id
       WHERE pd.project_id = ?
       ORDER BY pd.uploaded_at DESC`,
      [id]
    );

    // Fetch review schedules
    const [schedules] = await pool.execute(
      `SELECT rs.*, stg.stage_name, u.full_name as scheduled_by_name
       FROM review_schedules rs
       JOIN review_stages stg ON rs.stage_id = stg.id
       JOIN users u ON rs.scheduled_by = u.id
       WHERE rs.project_id = ?
       ORDER BY rs.scheduled_at ASC`,
      [id]
    );

    // Fetch reviews with score details
    const [reviews] = await pool.execute(
      `SELECT r.*, stg.stage_name, stg.stage_order, u.full_name as reviewer_name, u.email as reviewer_email
       FROM reviews r
       JOIN review_stages stg ON r.stage_id = stg.id
       JOIN users u ON r.reviewer_id = u.id
       WHERE r.project_id = ?
       ORDER BY stg.stage_order ASC, r.created_at DESC`,
      [id]
    );

    // Fetch scores for each review
    for (const review of reviews) {
      const [scores] = await pool.execute(
        `SELECT sc.*, rc.criterion_name, rc.maximum_marks, rc.display_order
         FROM review_scores sc
         JOIN review_criteria rc ON sc.criterion_id = rc.id
         WHERE sc.review_id = ?
         ORDER BY rc.display_order ASC`,
        [review.id]
      );
      review.scores = scores;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...project,
        members,
        assignments,
        documents,
        schedules,
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const { title, description, objectives, technology_stack, category, team_members } = req.body;
    const studentId = req.user.id;

    // Insert project record
    const [result] = await pool.execute(
      `INSERT INTO projects (title, description, objectives, technology_stack, category, created_by, status, current_stage_id)
       VALUES (?, ?, ?, ?, ?, ?, 'Draft', 1)`,
      [title, description, objectives, technology_stack, category || 'Web Development', studentId]
    );

    const projectId = result.insertId;

    // Add creator as Team Lead member
    await pool.execute(
      `INSERT INTO project_members (project_id, student_id, team_role)
       VALUES (?, ?, 'Team Lead')`,
      [projectId, studentId]
    );

    // Add any initial team members provided
    if (Array.isArray(team_members) && team_members.length > 0) {
      for (const member of team_members) {
        if (!member.student_id || member.student_id === studentId) continue;
        try {
          await pool.execute(
            `INSERT INTO project_members (project_id, student_id, team_role) VALUES (?, ?, ?)`,
            [projectId, member.student_id, member.team_role || 'Member']
          );
        } catch (mErr) {
          console.warn('Member insertion skipped:', mErr.message);
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Project created successfully in Draft mode.',
      projectId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, objectives, technology_stack, category } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    const [projects] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = projects[0];

    // Students can only update if status is Draft or Changes Required
    if (role === 'student') {
      if (project.created_by !== userId) {
        return res.status(403).json({ success: false, message: 'Only the project creator can edit project details.' });
      }
      if (!['Draft', 'Changes Required'].includes(project.status)) {
        return res.status(400).json({
          success: false,
          message: `Project cannot be modified while in '${project.status}' status.`,
        });
      }
    }

    await pool.execute(
      `UPDATE projects 
       SET title = ?, description = ?, objectives = ?, technology_stack = ?, category = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        title || project.title,
        description || project.description,
        objectives || project.objectives,
        technology_stack || project.technology_stack,
        category || project.category,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const submitProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [projects] = await pool.execute('SELECT * FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const project = projects[0];

    // Verify user is project creator or member
    const [membership] = await pool.execute(
      'SELECT id FROM project_members WHERE project_id = ? AND student_id = ?',
      [id, userId]
    );
    if (project.created_by !== userId && membership.length === 0) {
      return res.status(403).json({ success: false, message: 'Access denied. You are not a member of this project.' });
    }

    let nextStatus = 'Submitted';
    if (project.status === 'Changes Required') {
      nextStatus = 'Resubmitted';
    } else if (project.status !== 'Draft') {
      return res.status(400).json({
        success: false,
        message: `Project cannot be submitted from current status '${project.status}'.`,
      });
    }

    await pool.execute(
      `UPDATE projects 
       SET status = ?, submitted_at = NOW(), updated_at = NOW() 
       WHERE id = ?`,
      [nextStatus, id]
    );

    // Notify administrators
    await notifyAdmins({
      title: `Project ${nextStatus}: ${project.title}`,
      message: `The project "${project.title}" has been ${nextStatus.toLowerCase()} by the team.`,
      notificationType: nextStatus === 'Resubmitted' ? 'project_resubmitted' : 'project_submission',
      link: `/admin/projects/${id}`,
    });

    return res.status(200).json({
      success: true,
      message: `Project successfully ${nextStatus.toLowerCase()} for evaluation.`,
      status: nextStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { identifier_or_email, team_role } = req.body;
    const userId = req.user.id;

    // Verify caller is project creator
    const [projects] = await pool.execute('SELECT created_by, status FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }
    if (projects[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only project creators or admins can add members.' });
    }

    // Find student
    const [students] = await pool.execute(
      `SELECT id, full_name, email, student_or_faculty_identifier 
       FROM users 
       WHERE role = 'student' AND (email = ? OR student_or_faculty_identifier = ?)`,
      [identifier_or_email, identifier_or_email]
    );

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No student found with the provided email or roll number.',
      });
    }

    const student = students[0];

    // Check if already a member
    const [existing] = await pool.execute(
      'SELECT id FROM project_members WHERE project_id = ? AND student_id = ?',
      [id, student.id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Student is already a member of this project team.' });
    }

    await pool.execute(
      `INSERT INTO project_members (project_id, student_id, team_role) VALUES (?, ?, ?)`,
      [id, student.id, team_role || 'Member']
    );

    // Notify student
    await createNotification({
      userId: student.id,
      title: 'Added to Project Team',
      message: `You were added to the team for project #${id}.`,
      notificationType: 'general',
      link: `/student/projects/${id}`,
    });

    return res.status(201).json({
      success: true,
      message: `${student.full_name} added to project team successfully.`,
      member: {
        user_id: student.id,
        full_name: student.full_name,
        email: student.email,
        student_or_faculty_identifier: student.student_or_faculty_identifier,
        team_role: team_role || 'Member',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user.id;

    const [projects] = await pool.execute('SELECT created_by FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    if (projects[0].created_by !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only project creators or admins can remove members.' });
    }

    // Check member
    const [members] = await pool.execute('SELECT student_id FROM project_members WHERE id = ? AND project_id = ?', [
      memberId,
      id,
    ]);
    if (members.length === 0) {
      return res.status(404).json({ success: false, message: 'Member not found in this project.' });
    }

    if (members[0].student_id === projects[0].created_by) {
      return res.status(400).json({ success: false, message: 'Cannot remove the project creator from the team.' });
    }

    await pool.execute('DELETE FROM project_members WHERE id = ?', [memberId]);

    return res.status(200).json({ success: true, message: 'Team member removed successfully.' });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { document_type } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a document file to upload.' });
    }

    const { originalname, filename, path: filePath, size, mimetype } = req.file;

    const [result] = await pool.execute(
      `INSERT INTO project_documents (project_id, uploaded_by, original_filename, stored_filename, file_path, file_size, mime_type, document_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, originalname, filename, filePath, size, mimetype, document_type || 'Proposal']
    );

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully.',
      document: {
        id: result.insertId,
        original_filename: originalname,
        stored_filename: filename,
        file_size: size,
        mime_type: mimetype,
        document_type: document_type || 'Proposal',
        uploaded_at: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const { role, id: userId } = req.user;

    // Check authorization for document access
    if (role === 'student') {
      const [access] = await pool.execute(
        `SELECT p.id FROM projects p 
         LEFT JOIN project_members pm ON p.id = pm.project_id 
         WHERE p.id = ? AND (p.created_by = ? OR pm.student_id = ?)`,
        [id, userId, userId]
      );
      if (access.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied to this document.' });
      }
    } else if (role === 'faculty') {
      const [access] = await pool.execute(
        `SELECT id FROM project_assignments WHERE project_id = ? AND faculty_id = ?`,
        [id, userId]
      );
      if (access.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied. You are not assigned to this project.' });
      }
    }

    const [docs] = await pool.execute(
      'SELECT original_filename, stored_filename, file_path FROM project_documents WHERE id = ? AND project_id = ?',
      [docId, id]
    );

    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Document record not found.' });
    }

    const doc = docs[0];
    const absoluteFilePath = path.resolve(doc.file_path);

    if (!fs.existsSync(absoluteFilePath)) {
      return res.status(404).json({ success: false, message: 'Physical document file not found on server.' });
    }

    return res.download(absoluteFilePath, doc.original_filename);
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req, res, next) => {
  try {
    const { id, docId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const [docs] = await pool.execute(
      'SELECT id, uploaded_by, file_path FROM project_documents WHERE id = ? AND project_id = ?',
      [docId, id]
    );

    if (docs.length === 0) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    const doc = docs[0];
    if (doc.uploaded_by !== userId && role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this document.' });
    }

    // Delete file if exists
    if (fs.existsSync(doc.file_path)) {
      try {
        fs.unlinkSync(doc.file_path);
      } catch (err) {
        console.warn('Failed to delete file on disk:', err.message);
      }
    }

    await pool.execute('DELETE FROM project_documents WHERE id = ?', [docId]);

    return res.status(200).json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
