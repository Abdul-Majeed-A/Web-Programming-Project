import pool from '../config/database.js';

export const createNotification = async ({
  userId,
  title,
  message,
  notificationType = 'general',
  link = null,
}) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO notifications (user_id, title, message, notification_type, link) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, title, message, notificationType, link]
    );
    return result.insertId;
  } catch (error) {
    console.error(`Failed to create notification for user ${userId}:`, error.message);
    return null;
  }
};

export const notifyProjectMembers = async (projectId, { title, message, notificationType, link }) => {
  try {
    const [members] = await pool.execute(
      `SELECT student_id FROM project_members WHERE project_id = ? 
       UNION 
       SELECT created_by as student_id FROM projects WHERE id = ?`,
      [projectId, projectId]
    );

    const userIds = [...new Set(members.map((m) => m.student_id))];
    for (const uId of userIds) {
      await createNotification({
        userId: uId,
        title,
        message,
        notificationType,
        link,
      });
    }
  } catch (error) {
    console.error(`Failed to notify members of project ${projectId}:`, error.message);
  }
};

export const notifyAdmins = async ({ title, message, notificationType, link }) => {
  try {
    const [admins] = await pool.execute("SELECT id FROM users WHERE role = 'admin' AND account_status = 'active'");
    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title,
        message,
        notificationType,
        link,
      });
    }
  } catch (error) {
    console.error('Failed to notify admins:', error.message);
  }
};
