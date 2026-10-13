import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Calendar,
  Award,
  ArrowRight,
  ClipboardCheck,
  Video,
} from 'lucide-react';

const FacultyDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/faculty');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load faculty dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading faculty evaluation workspace..." />;

  const stats = data?.stats || {};
  const assignedProjects = data?.assignedProjects || [];
  const upcomingSchedules = data?.upcomingSchedules || [];

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Faculty Reviewer Dashboard
          </h3>
          <p className="text-muted small mb-0">Evaluate assigned student software projects and record rubric marks.</p>
        </div>
        <div>
          <Button as={Link} to="/faculty/assigned" variant="primary" className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2">
            <ClipboardCheck size={18} /> View All Assigned Projects
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

      {/* KPI Stats */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={4}>
          <StatCard
            title="Assigned Projects"
            value={stats.total_assigned}
            icon={FolderKanban}
            color="primary"
            subtitle="Projects under your review panel"
          />
        </Col>
        <Col sm={6} lg={4}>
          <StatCard
            title="Pending Evaluations"
            value={stats.pending_evaluations}
            icon={Clock}
            color="warning"
            subtitle="Submissions awaiting your assessment"
          />
        </Col>
        <Col sm={6} lg={4}>
          <StatCard
            title="Completed Reviews"
            value={stats.completed_evaluations}
            icon={CheckCircle2}
            color="success"
            subtitle="Submitted evaluations"
          />
        </Col>
      </Row>

      <Row className="g-4">
        {/* Left Column: Assigned Projects Table */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-0">Assigned Software Projects</h5>
                <span className="text-muted small">Projects assigned by the administrator</span>
              </div>
              <Link to="/faculty/assigned" className="small fw-semibold text-primary text-decoration-none">
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-4">
              {assignedProjects.length === 0 ? (
                <div className="text-center py-5">
                  <FolderKanban size={36} className="text-muted mb-2" />
                  <h6 className="fw-bold text-dark">No projects assigned currently</h6>
                  <p className="text-muted small mb-0">Once the administrator assigns projects to you, they will appear here.</p>
                </div>
              ) : (
                <Table responsive hover className="align-middle mb-0">
                  <thead className="table-light small text-uppercase text-muted">
                    <tr>
                      <th>Project Title</th>
                      <th>Category</th>
                      <th>Lead Student</th>
                      <th>Current Stage</th>
                      <th>Status</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {assignedProjects.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="fw-bold text-dark">{p.title}</div>
                          <div className="text-muted text-truncate" style={{ maxWidth: '200px', fontSize: '0.72rem' }}>
                            {p.technology_stack}
                          </div>
                        </td>
                        <td>
                          <Badge bg="light" text="dark" className="border px-2 py-1">
                            {p.category}
                          </Badge>
                        </td>
                        <td>{p.creator_name}</td>
                        <td>
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">
                            {p.stage_name}
                          </span>
                        </td>
                        <td><StatusBadge status={p.status} /></td>
                        <td className="text-end">
                          <Button
                            as={Link}
                            to={`/faculty/review/${p.id}`}
                            variant="primary"
                            size="sm"
                            className="rounded-pill px-3 shadow-xs"
                          >
                            Evaluate
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Upcoming Review Sessions */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
            <Card.Header className="bg-transparent border-0 pt-2 px-2 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0 fs-6">Upcoming Review Sessions</h5>
              <Link to="/faculty/schedules" className="small fw-semibold text-primary text-decoration-none">
                All
              </Link>
            </Card.Header>
            <Card.Body className="p-2 pt-3">
              {upcomingSchedules.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No upcoming reviews scheduled.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {upcomingSchedules.map((s) => (
                    <div key={s.id} className="p-3 border rounded-3 bg-light border-start border-4 border-primary">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge bg-primary small">{s.stage_name}</span>
                        <span className="small text-muted d-flex align-items-center gap-1">
                          <Calendar size={13} /> {formatDate(s.scheduled_at)}
                        </span>
                      </div>
                      <h6 className="fw-semibold text-dark mb-1 small">{s.project_title}</h6>
                      <div className="text-muted small mb-2" style={{ fontSize: '0.78rem' }}>
                        Time: {new Date(s.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      {s.location_or_meeting_link && (
                        <div className="small text-truncate text-secondary d-flex align-items-center gap-1">
                          <Video size={13} className="text-primary flex-shrink-0" />
                          <span className="text-truncate">{s.location_or_meeting_link}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default FacultyDashboard;
