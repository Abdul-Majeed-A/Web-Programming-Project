import pool from '../config/database.js';

export const getProjectReports = async (req, res, next) => {
  try {
    const { department, status, category, fromDate, toDate } = req.query;

    let queryStr = `
      SELECT p.id, p.title, p.category, p.technology_stack, p.status, p.final_score, p.created_at, p.submitted_at,
             rs.stage_name as current_stage,
             u.full_name as student_leader, u.email as leader_email, u.department, u.student_or_faculty_identifier as roll_number,
             (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as team_size,
             (SELECT GROUP_CONCAT(fac.full_name SEPARATOR '; ') 
              FROM project_assignments pa 
              JOIN users fac ON pa.faculty_id = fac.id 
              WHERE pa.project_id = p.id) as assigned_reviewers
      FROM projects p
      JOIN users u ON p.created_by = u.id
      JOIN review_stages rs ON p.current_stage_id = rs.id
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      queryStr += ` AND u.department = ?`;
      params.push(department);
    }
    if (status) {
      queryStr += ` AND p.status = ?`;
      params.push(status);
    }
    if (category) {
      queryStr += ` AND p.category = ?`;
      params.push(category);
    }
    if (fromDate) {
      queryStr += ` AND p.created_at >= ?`;
      params.push(fromDate);
    }
    if (toDate) {
      queryStr += ` AND p.created_at <= ?`;
      params.push(`${toDate} 23:59:59`);
    }

    queryStr += ` ORDER BY p.created_at DESC`;
    const [reports] = await pool.execute(queryStr, params);

    return res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
};

export const exportProjectReportsCSV = async (req, res, next) => {
  try {
    const { department, status, category, fromDate, toDate } = req.query;

    let queryStr = `
      SELECT p.id, p.title, p.category, p.technology_stack, p.status, p.final_score, p.created_at,
             rs.stage_name as current_stage,
             u.full_name as student_leader, u.email as leader_email, u.department, u.student_or_faculty_identifier as roll_number,
             (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as team_size,
             (SELECT GROUP_CONCAT(fac.full_name SEPARATOR '; ') 
              FROM project_assignments pa 
              JOIN users fac ON pa.faculty_id = fac.id 
              WHERE pa.project_id = p.id) as assigned_reviewers
      FROM projects p
      JOIN users u ON p.created_by = u.id
      JOIN review_stages rs ON p.current_stage_id = rs.id
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      queryStr += ` AND u.department = ?`;
      params.push(department);
    }
    if (status) {
      queryStr += ` AND p.status = ?`;
      params.push(status);
    }
    if (category) {
      queryStr += ` AND p.category = ?`;
      params.push(category);
    }
    if (fromDate) {
      queryStr += ` AND p.created_at >= ?`;
      params.push(fromDate);
    }
    if (toDate) {
      queryStr += ` AND p.created_at <= ?`;
      params.push(`${toDate} 23:59:59`);
    }

    queryStr += ` ORDER BY p.created_at DESC`;
    const [rows] = await pool.execute(queryStr, params);

    // Generate CSV string
    const headers = [
      'Project ID',
      'Title',
      'Category',
      'Technology Stack',
      'Status',
      'Current Stage',
      'Final Score',
      'Student Lead',
      'Roll Number',
      'Department',
      'Team Size',
      'Assigned Reviewers',
      'Created Date',
    ];

    const csvLines = [headers.join(',')];
    for (const r of rows) {
      const line = [
        r.id,
        `"${(r.title || '').replace(/"/g, '""')}"`,
        `"${(r.category || '').replace(/"/g, '""')}"`,
        `"${(r.technology_stack || '').replace(/"/g, '""')}"`,
        r.status,
        `"${(r.current_stage || '').replace(/"/g, '""')}"`,
        r.final_score !== null ? r.final_score : 'N/A',
        `"${(r.student_leader || '').replace(/"/g, '""')}"`,
        `"${(r.roll_number || '').replace(/"/g, '""')}"`,
        `"${(r.department || '').replace(/"/g, '""')}"`,
        r.team_size || 1,
        `"${(r.assigned_reviewers || '').replace(/"/g, '""')}"`,
        r.created_at,
      ];
      csvLines.push(line.join(','));
    }

    const csvContent = csvLines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="projectpulse_projects_report.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const getEvaluationReports = async (req, res, next) => {
  try {
    const { stageId, decision, reviewerId, fromDate, toDate } = req.query;

    let queryStr = `
      SELECT r.id as review_id, r.total_marks, r.percentage, r.decision, r.submitted_at,
             p.id as project_id, p.title as project_title, p.category,
             stg.stage_name, stg.stage_order,
             uRev.full_name as reviewer_name, uRev.department as reviewer_department,
             uLead.full_name as lead_student_name, uLead.department as student_department
      FROM reviews r
      JOIN projects p ON r.project_id = p.id
      JOIN review_stages stg ON r.stage_id = stg.id
      JOIN users uRev ON r.reviewer_id = uRev.id
      JOIN users uLead ON p.created_by = uLead.id
      WHERE r.review_status = 'Submitted'
    `;
    const params = [];

    if (stageId) {
      queryStr += ` AND r.stage_id = ?`;
      params.push(stageId);
    }
    if (decision) {
      queryStr += ` AND r.decision = ?`;
      params.push(decision);
    }
    if (reviewerId) {
      queryStr += ` AND r.reviewer_id = ?`;
      params.push(reviewerId);
    }
    if (fromDate) {
      queryStr += ` AND r.submitted_at >= ?`;
      params.push(fromDate);
    }
    if (toDate) {
      queryStr += ` AND r.submitted_at <= ?`;
      params.push(`${toDate} 23:59:59`);
    }

    queryStr += ` ORDER BY r.submitted_at DESC`;
    const [reports] = await pool.execute(queryStr, params);

    return res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    next(error);
  }
};

export const exportEvaluationReportsCSV = async (req, res, next) => {
  try {
    const { stageId, decision, reviewerId, fromDate, toDate } = req.query;

    let queryStr = `
      SELECT r.id as review_id, r.total_marks, r.percentage, r.decision, r.submitted_at,
             p.id as project_id, p.title as project_title, p.category,
             stg.stage_name,
             uRev.full_name as reviewer_name, uRev.department as reviewer_department,
             uLead.full_name as lead_student_name, uLead.department as student_department
      FROM reviews r
      JOIN projects p ON r.project_id = p.id
      JOIN review_stages stg ON r.stage_id = stg.id
      JOIN users uRev ON r.reviewer_id = uRev.id
      JOIN users uLead ON p.created_by = uLead.id
      WHERE r.review_status = 'Submitted'
    `;
    const params = [];

    if (stageId) {
      queryStr += ` AND r.stage_id = ?`;
      params.push(stageId);
    }
    if (decision) {
      queryStr += ` AND r.decision = ?`;
      params.push(decision);
    }
    if (reviewerId) {
      queryStr += ` AND r.reviewer_id = ?`;
      params.push(reviewerId);
    }
    if (fromDate) {
      queryStr += ` AND r.submitted_at >= ?`;
      params.push(fromDate);
    }
    if (toDate) {
      queryStr += ` AND r.submitted_at <= ?`;
      params.push(`${toDate} 23:59:59`);
    }

    queryStr += ` ORDER BY r.submitted_at DESC`;
    const [rows] = await pool.execute(queryStr, params);

    const headers = [
      'Review ID',
      'Project ID',
      'Project Title',
      'Stage',
      'Reviewer Name',
      'Reviewer Dept',
      'Student Lead',
      'Student Dept',
      'Marks (100)',
      'Percentage',
      'Decision',
      'Submitted At',
    ];

    const csvLines = [headers.join(',')];
    for (const r of rows) {
      const line = [
        r.review_id,
        r.project_id,
        `"${(r.project_title || '').replace(/"/g, '""')}"`,
        `"${(r.stage_name || '').replace(/"/g, '""')}"`,
        `"${(r.reviewer_name || '').replace(/"/g, '""')}"`,
        `"${(r.reviewer_department || '').replace(/"/g, '""')}"`,
        `"${(r.lead_student_name || '').replace(/"/g, '""')}"`,
        `"${(r.student_department || '').replace(/"/g, '""')}"`,
        r.total_marks,
        `${r.percentage}%`,
        r.decision,
        r.submitted_at,
      ];
      csvLines.push(line.join(','));
    }

    const csvContent = csvLines.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="projectpulse_evaluations_report.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
