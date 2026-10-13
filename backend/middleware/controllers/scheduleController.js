import pool from '../config/database.js';
import { notifyProjectMembers, createNotification } from '../services/notificationService.js';

export const getSchedules = async (req, res, next) => {
  try {
    const { projectId, status } = req.query;
    const { role, id: userId } = req.user;

    let queryStr = `
      SELECT rs.*, 
             p.title as project_title, p.category as project_category,
             stg.stage_name, stg.stage_order,
             adm.full_name as scheduled_by_name
      FROM review_schedules rs
      JOIN projects p ON rs.project_id = p.id
      JOIN review_stages stg ON rs.stage_id = stg.id
      JOIN users adm ON rs.scheduled_by = adm.id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'student') {
      queryStr += ` AND (p.created_by = ? OR p.id IN (SELECT project_id FROM project_members WHERE student_id = ?))`;
      params.push(userId, userId);
    } else if (role === 'faculty') {
      queryStr += ` AND p.id IN (SELECT project_id FROM project_assignments WHERE faculty_id = ?)`;
      params.push(userId);
    }

    if (projectId) {
      queryStr += ` AND rs.project_id = ?`;
      params.push(projectId);
    }
    if (status) {
      queryStr += ` AND rs.status = ?`;
      params.push(status);
    }

    queryStr += ` ORDER BY rs.scheduled_at ASC`;
    const [schedules] = await pool.execute(queryStr, params);

    return res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const { project_id, stage_id, scheduled_at, location_or_meeting_link, notes } = req.body;
    const adminId = req.user.id;

    if (!project_id || !stage_id || !scheduled_at) {
      return res.status(400).json({ success: false, message: 'Project, review stage, and scheduled date/time are required.' });
    }

    const [projects] = await pool.execute('SELECT title FROM projects WHERE id = ?', [project_id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const [stages] = await pool.execute('SELECT stage_name FROM review_stages WHERE id = ?', [stage_id]);

    const [result] = await pool.execute(
      `INSERT INTO review_schedules (project_id, stage_id, scheduled_by, scheduled_at, location_or_meeting_link, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Scheduled')`,
      [project_id, stage_id, adminId, scheduled_at, location_or_meeting_link || null, notes || null]
    );

    const projectTitle = projects[0].title;
    const stageName = stages[0]?.stage_name || `Stage ${stage_id}`;

    // Notify project members
    await notifyProjectMembers(project_id, {
      title: `${stageName} Scheduled`,
      message: `A review session for "${projectTitle}" has been scheduled for ${new Date(scheduled_at).toLocaleString()}${location_or_meeting_link ? ` at ${location_or_meeting_link}` : ''}.`,
      notificationType: 'review_scheduled',
      link: `/student/schedules`,
    });

    // Notify assigned faculty
    const [assignments] = await pool.execute('SELECT faculty_id FROM project_assignments WHERE project_id = ?', [
      project_id,
    ]);
    for (const a of assignments) {
      await createNotification({
        userId: a.faculty_id,
        title: `Review Scheduled: ${projectTitle}`,
        message: `${stageName} scheduled for ${new Date(scheduled_at).toLocaleString()}.`,
        notificationType: 'review_scheduled',
        link: `/faculty/schedules`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Review schedule created successfully.',
      scheduleId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scheduled_at, location_or_meeting_link, notes, status } = req.body;

    const [schedules] = await pool.execute('SELECT * FROM review_schedules WHERE id = ?', [id]);
    if (schedules.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    const schedule = schedules[0];

    await pool.execute(
      `UPDATE review_schedules 
       SET scheduled_at = ?, location_or_meeting_link = ?, notes = ?, status = ?
       WHERE id = ?`,
      [
        scheduled_at || schedule.scheduled_at,
        location_or_meeting_link !== undefined ? location_or_meeting_link : schedule.location_or_meeting_link,
        notes !== undefined ? notes : schedule.notes,
        status || schedule.status,
        id,
      ]
    );

    return res.status(200).json({ success: true, message: 'Review schedule updated successfully.' });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM review_schedules WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: 'Schedule deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
