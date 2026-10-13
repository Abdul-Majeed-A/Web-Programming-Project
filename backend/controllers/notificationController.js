import pool from '../config/database.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [notifications] = await pool.execute(
      `SELECT id, title, message, notification_type, link, is_read, created_at 
       FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC LIMIT 30`,
      [userId]
    );

    const [unread] = await pool.execute(
      'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount: unread[0]?.unread_count || 0,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const broadcastNotification = async (req, res, next) => {
  try {
    const { title, message, targetRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }

    let userQuery = 'SELECT id FROM users WHERE account_status = "active"';
    const params = [];

    if (targetRole && ['student', 'faculty', 'admin'].includes(targetRole)) {
      userQuery += ' AND role = ?';
      params.push(targetRole);
    }

    const [users] = await pool.execute(userQuery, params);

    for (const u of users) {
      await pool.execute(
        `INSERT INTO notifications (user_id, title, message, notification_type, link) 
         VALUES (?, ?, ?, 'general', NULL)`,
        [u.id, title, message]
      );
    }

    return res.status(201).json({
      success: true,
      message: `Broadcast sent successfully to ${users.length} users.`,
    });
  } catch (error) {
    next(error);
  }
};
