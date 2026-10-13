import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import { Bell, Send, CheckCircle, AlertCircle } from 'lucide-react';

const NotificationManagement = () => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) {
      setError('Title and message are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/notifications/broadcast', form);
      if (res.data.success) {
        setSuccess(res.data.message);
        setForm({ title: '', message: '', targetRole: '' });
      } else {
        setError(res.data.message || 'Failed to send broadcast.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error broadcasting notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Broadcast System Notifications
        </h3>
        <p className="text-muted small mb-0">Dispatch institutional announcements and deadline reminders to student and faculty portals.</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <Card.Body>
              {success && (
                <Alert variant="success" className="rounded-3 mb-4">
                  <CheckCircle size={16} className="me-2 d-inline" /> {success}
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="rounded-3 mb-4">
                  <AlertCircle size={16} className="me-2 d-inline" /> {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Target Audience *</Form.Label>
                  <Form.Select
                    value={form.targetRole}
                    onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                    className="py-2"
                  >
                    <option value="">All Users (Students, Faculty & Staff)</option>
                    <option value="student">Students Only</option>
                    <option value="faculty">Faculty Reviewers Only</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Notification Title *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Review 2 Submission Deadline Reminder"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-muted">Announcement Content *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder="Detailed message regarding deadlines, presentation guidelines, or venue changes..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="py-2"
                  />
                </Form.Group>

                <div className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
                  >
                    <Send size={16} /> {loading ? 'Broadcasting...' : 'Broadcast Notification'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default NotificationManagement;
