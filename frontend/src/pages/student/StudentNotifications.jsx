import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';
import { Bell, CheckCheck, ExternalLink } from 'lucide-react';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (loading) return <LoadingSpinner text="Loading notifications..." />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Notifications Center
          </h3>
          <p className="text-muted small mb-0">Review schedule alerts, submission updates, and evaluation results.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline-primary" size="sm" className="rounded-pill px-3 d-flex align-items-center gap-1.5" onClick={handleMarkAllAsRead}>
            <CheckCheck size={16} /> Mark All as Read
          </Button>
        )}
      </div>

      <Card className="border-0 shadow-sm rounded-4 bg-white p-3">
        <Card.Body className="p-2">
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <Bell size={36} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark">No notifications yet</h6>
              <p className="text-muted small mb-0">System notifications and faculty review updates will appear here.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2.5">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 rounded-3 border d-flex justify-content-between align-items-start gap-3 transition-all ${
                    !n.is_read ? 'bg-primary bg-opacity-5 border-primary border-opacity-25' : 'bg-light'
                  }`}
                >
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <h6 className="fw-bold text-dark mb-0 small">{n.title}</h6>
                      {!n.is_read && <Badge bg="primary" pill style={{ fontSize: '0.65rem' }}>New</Badge>}
                    </div>
                    <p className="text-secondary small mb-2">{n.message}</p>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                      {formatDateTime(n.created_at)}
                    </span>
                  </div>

                  <div className="d-flex align-items-center gap-2 flex-shrink-0">
                    {n.link && (
                      <Link to={n.link} className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-1">
                        View <ExternalLink size={13} />
                      </Link>
                    )}
                    {!n.is_read && (
                      <Button variant="light" size="sm" className="rounded-pill p-1.5" onClick={() => handleMarkAsRead(n.id)} title="Mark as read">
                        <CheckCheck size={16} className="text-muted" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default StudentNotifications;
