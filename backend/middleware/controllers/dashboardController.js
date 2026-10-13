import pool from '../config/database.js';

export const getStudentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.id;

    // Total and status project counts
    const [projectStats] = await pool.execute(
      `SELECT 
         COUNT(*) as total_projects,
         SUM(CASE WHEN p.status = 'Approved' THEN 1 ELSE 0 END) as approved_projects,
         SUM(CASE WHEN p.status = 'Changes Required' THEN 1 ELSE 0 END) as changes_required_projects,
         SUM(CASE WHEN p.status IN ('Submitted', 'Under Review', 'Resubmitted') THEN 1 ELSE 0 END) as under_review_projects
       FROM projects p
       WHERE p.created_by = ? OR p.id IN (SELECT project_id FROM project_members WHERE student_id = ?)`,
      [studentId, studentId]
    );

    // Active projects
    const [activeProjects] = await pool.execute(
      `SELECT p.id, p.title, p.status, p.category, p.current_stage_id, rs.stage_name, rs.stage_order, p.final_score, p.updated_at
       FROM projects p
       JOIN review_stages rs ON p.current_stage_id = rs.id
       WHERE p.created_by = ? OR p.id IN (SELECT project_id FROM project_members WHERE student_id = ?)
       ORDER BY p.updated_at DESC LIMIT 5`,
      [studentId, studentId]
    );

    // Upcoming schedules
    const [upcomingSchedules] = await pool.execute(
      `SELECT rs.*, p.title as project_title, stg.stage_name
       FROM review_schedules rs
       JOIN projects p ON rs.project_id = p.id
       JOIN review_stages stg ON rs.stage_id = stg.id
       WHERE (p.created_by = ? OR p.id IN (SELECT project_id FROM project_members WHERE student_id = ?))
         AND rs.status = 'Scheduled'
       ORDER BY rs.scheduled_at ASC LIMIT 5`,
      [studentId, studentId]
    );

    // Recent feedback / evaluations
    const [recentEvaluations] = await pool.execute(
      `SELECT r.id, r.project_id, p.title as project_title, stg.stage_name, r.total_marks, r.percentage, r.decision, r.feedback, r.submitted_at, u.full_name as reviewer_name
       FROM reviews r
       JOIN projects p ON r.project_id = p.id
       JOIN review_stages stg ON r.stage_id = stg.id
       JOIN users u ON r.reviewer_id = u.id
       WHERE (p.created_by = ? OR p.id IN (SELECT project_id FROM project_members WHERE student_id = ?))
         AND r.review_status = 'Submitted'
       ORDER BY r.submitted_at DESC LIMIT 5`,
      [studentId, studentId]
    );

    return res.status(200).json({
      success: true,
      data: {
        stats: projectStats[0] || {
          total_projects: 0,
          approved_projects: 0,
          changes_required_projects: 0,
          under_review_projects: 0,
        },
        activeProjects,
        upcomingSchedules,
        recentEvaluations,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyDashboard = async (req, res, next) => {
  try {
    const facultyId = req.user.id;

    // Assigned projects count
    const [assignedStats] = await pool.execute(
      `SELECT COUNT(*) as total_assigned FROM project_assignments WHERE faculty_id = ?`,
      [facultyId]
    );

    // Completed evaluations count
    const [completedStats] = await pool.execute(
      `SELECT COUNT(*) as completed_evaluations FROM reviews WHERE reviewer_id = ? AND review_status = 'Submitted'`,
      [facultyId]
    );

    // Pending evaluations count
    const [pendingStats] = await pool.execute(
      `SELECT COUNT(*) as pending_evaluations
       FROM project_assignments pa
       JOIN projects p ON pa.project_id = p.id
       LEFT JOIN reviews r ON r.project_id = p.id AND r.stage_id = p.current_stage_id AND r.reviewer_id = pa.faculty_id AND r.review_status = 'Submitted'
       WHERE pa.faculty_id = ? AND r.id IS NULL AND p.status IN ('Submitted', 'Under Review', 'Resubmitted')`,
      [facultyId]
    );

    // Assigned projects list
    const [assignedProjects] = await pool.execute(
      `SELECT p.id, p.title, p.status, p.category, p.technology_stack, rs.id as current_stage_id, rs.stage_name, rs.stage_order,
              u.full_name as creator_name,
              (SELECT review_status FROM reviews WHERE project_id = p.id AND stage_id = p.current_stage_id AND reviewer_id = ?) as my_review_status
       FROM project_assignments pa
       JOIN projects p ON pa.project_id = p.id
       JOIN review_stages rs ON p.current_stage_id = rs.id
       JOIN users u ON p.created_by = u.id
       WHERE pa.faculty_id = ?
       ORDER BY p.updated_at DESC LIMIT 10`,
      [facultyId, facultyId]
    );

    // Upcoming schedules
    const [upcomingSchedules] = await pool.execute(
      `SELECT rs.*, p.title as project_title, stg.stage_name
       FROM review_schedules rs
       JOIN projects p ON rs.project_id = p.id
       JOIN review_stages stg ON rs.stage_id = stg.id
       JOIN project_assignments pa ON p.id = pa.project_id
       WHERE pa.faculty_id = ? AND rs.status = 'Scheduled'
       ORDER BY rs.scheduled_at ASC LIMIT 5`,
      [facultyId]
    );

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          total_assigned: assignedStats[0]?.total_assigned || 0,
          completed_evaluations: completedStats[0]?.completed_evaluations || 0,
          pending_evaluations: pendingStats[0]?.pending_evaluations || 0,
        },
        assignedProjects,
        upcomingSchedules,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. Overall counts
    const [userCounts] = await pool.execute(
      `SELECT 
         SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as total_students,
         SUM(CASE WHEN role = 'faculty' THEN 1 ELSE 0 END) as total_faculty
       FROM users WHERE account_status = 'active'`
    );

    const [projectCounts] = await pool.execute(
      `SELECT 
         COUNT(*) as total_projects,
         SUM(CASE WHEN status IN ('Submitted', 'Under Review', 'Resubmitted') THEN 1 ELSE 0 END) as awaiting_review,
         SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved_projects,
         SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected_projects,
         SUM(CASE WHEN status = 'Draft' THEN 1 ELSE 0 END) as draft_projects
       FROM projects`
    );

    const [reviewCounts] = await pool.execute(
      `SELECT 
         SUM(CASE WHEN review_status = 'Submitted' THEN 1 ELSE 0 END) as completed_evaluations,
         SUM(CASE WHEN review_status = 'Draft' THEN 1 ELSE 0 END) as draft_evaluations
       FROM reviews`
    );

    // 2. Status distribution for charts
    const [statusDist] = await pool.execute(
      `SELECT status, COUNT(*) as count FROM projects GROUP BY status ORDER BY count DESC`
    );

    // 3. Stage distribution for charts
    const [stageDist] = await pool.execute(
      `SELECT rs.stage_name, rs.stage_order, COUNT(p.id) as count
       FROM review_stages rs
       LEFT JOIN projects p ON p.current_stage_id = rs.id
       GROUP BY rs.id, rs.stage_name, rs.stage_order
       ORDER BY rs.stage_order ASC`
    );

    // 4. Department distribution
    const [deptDist] = await pool.execute(
      `SELECT u.department, COUNT(p.id) as project_count
       FROM projects p
       JOIN users u ON p.created_by = u.id
       GROUP BY u.department
       ORDER BY project_count DESC LIMIT 5`
    );

    // 5. Recent registered projects
    const [recentProjects] = await pool.execute(
      `SELECT p.id, p.title, p.status, p.category, rs.stage_name, u.full_name as creator_name, p.created_at
       FROM projects p
       JOIN review_stages rs ON p.current_stage_id = rs.id
       JOIN users u ON p.created_by = u.id
       ORDER BY p.created_at DESC LIMIT 6`
    );

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          total_students: userCounts[0]?.total_students || 0,
          total_faculty: userCounts[0]?.total_faculty || 0,
          total_projects: projectCounts[0]?.total_projects || 0,
          awaiting_review: projectCounts[0]?.awaiting_review || 0,
          approved_projects: projectCounts[0]?.approved_projects || 0,
          rejected_projects: projectCounts[0]?.rejected_projects || 0,
          draft_projects: projectCounts[0]?.draft_projects || 0,
          completed_evaluations: reviewCounts[0]?.completed_evaluations || 0,
        },
        statusDistribution: statusDist,
        stageDistribution: stageDist,
        departmentDistribution: deptDist,
        recentProjects,
      },
    });
  } catch (error) {
    next(error);
  }
};
