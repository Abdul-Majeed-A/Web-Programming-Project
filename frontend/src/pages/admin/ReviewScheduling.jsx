import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatters';
import { CalendarDays, Video, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const ReviewScheduling = () => {
  const [schedules, setSchedules] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    project_id: '',
    stage_id: '1',
    scheduled_at: '',
    location_or_meeting_link: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [schedRes, projRes, stageRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/projects'),
        api.get('/reviews/stages'),
      ]);

      if (schedRes.data.success) setSchedules(schedRes.data.data);
      if (projRes.data.success) setProjects(projRes.data.data);
      if (stageRes.data.success) setStages(stageRes.data.data);
    } catch (err) {
      setError('Failed to load scheduling data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project_id || !form.stage_id || !form.scheduled_at) {
      setError('Please fill in Project, Stage, and Date/Time.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/schedules', {
        ...form,
        project_id: Number(form.project_id),
        stage_id: Number(form.stage_id),
      });

      if (res.data.success) {
        setMessage('Review session scheduled successfully! In-app notifications sent to team & reviewer.');
        setForm({
          project_id: '',
          stage_id: '1',
          scheduled_at: '',
          location_or_meeting_link: '',
          notes: '',
        });
        fetchData();
      } else {
        setError(res.data.message || 'Failed to schedule review.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error scheduling review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/schedules/${id}`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this scheduled review session?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete schedule.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading review schedules..." />;

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Schedule Review Sessions
        </h3>
        <p className="text-muted small mb-0">Coordinate presentation slots, venues, and video conferencing links for all stages.</p>
      </div>

      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')} className="rounded-3 mb-4">
          <CheckCircle size={16} className="me-2 d-inline" /> {message}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="rounded-3 mb-4">
          <AlertCircle size={16} className="me-2 d-inline" /> {error}
        </Alert>
      )}

      {/* Scheduler Form */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-4">
        <Card.Body className="p-0">
          <h5 className="fw-bold text-dark mb-3">Schedule Review Presentation</h5>
          <Form onSubmit={handleSubmit}>
            <Row className="gy-3">
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Select Project *</Form.Label>
                  <Form.Select
                    value={form.project_id}
                    onChange={(e) => setForm({ ...form, project_id: e.target.value })}
                    required
                    className="py-2"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.id} - {p.title} ({p.stage_name})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Review Stage *</Form.Label>
                  <Form.Select
                    value={form.stage_id}
                    onChange={(e) => setForm({ ...form, stage_id: e.target.value })}
                    required
                    className="py-2"
                  >
                    {stages.map((stg) => (
                      <option key={stg.id} value={stg.id}>{stg.stage_name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Date & Time *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    required
                    className="py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Location / Online Meeting Link</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Lab 304, CSE Block or Google Meet: https://meet.google.com/xyz"
                    value={form.location_or_meeting_link}
                    onChange={(e) => setForm({ ...form, location_or_meeting_link: e.target.value })}
                    className="py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Session Notes (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g. Bring printed architecture diagrams and slide deck"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="py-2"
                  />
                </Form.Group>
              </Col>

              <Col md={2} className="d-flex align-items-end">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  className="w-100 py-2 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                >
                  <CalendarDays size={16} /> {submitting ? 'Scheduling...' : 'Schedule'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Schedules Table */}
      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
          <h5 className="fw-bold text-dark mb-0">Scheduled Review Sessions</h5>
          <span className="text-muted small">All active and completed academic review presentations</span>
        </Card.Header>
        <Card.Body className="p-4">
          {schedules.length === 0 ? (
            <div className="text-center py-4 text-muted small">No review sessions scheduled yet.</div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th>Project</th>
                  <th>Stage</th>
                  <th>Scheduled Date & Time</th>
                  <th>Venue / Link</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <div className="fw-bold text-dark">#{s.project_id} - {s.project_title}</div>
                    </td>
                    <td><Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">{s.stage_name}</Badge></td>
                    <td className="fw-medium text-dark">{formatDateTime(s.scheduled_at)}</td>
                    <td>
                      {s.location_or_meeting_link ? (
                        <div className="d-flex align-items-center gap-1 text-primary">
                          <Video size={14} className="flex-shrink-0" />
                          <span className="text-truncate" style={{ maxWidth: '200px' }}>{s.location_or_meeting_link}</span>
                        </div>
                      ) : (
                        'TBD'
                      )}
                    </td>
                    <td className="text-muted">{s.notes || '—'}</td>
                    <td>
                      <Form.Select
                        size="sm"
                        value={s.status}
                        onChange={(e) => handleUpdateStatus(s.id, e.target.value)}
                        className="py-1 px-2 rounded-pill fw-semibold"
                        style={{ width: '130px' }}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Cancelled">Cancelled</option>
                      </Form.Select>
                    </td>
                    <td className="text-end">
                      <Button variant="outline-danger" size="sm" className="rounded-pill p-1.5" onClick={() => handleDelete(s.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReviewScheduling;
