import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import StatCard from '../../components/StatCard';
import ProjectCard from '../../components/ProjectCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PlusCircle,
  Calendar,
  MessageSquare,
  ArrowRight,
  Video,
} from 'lucide-react';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/student');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load student dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading your projects and evaluation status..." />;

  const stats = data?.stats || {};
  const activeProjects = data?.activeProjects || [];
  const upcomingSchedules = data?.upcomingSchedules || [];
  const recentEvaluations = data?.recentEvaluations || [];

  return (
    <div>
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Student Project Dashboard
          </h3>
          <p className="text-muted small mb-0">
            Track your software project milestones, reviews, and faculty feedback.
          </p>
        </div>
        <div>
          <Button as={Link} to="/student/projects/create" variant="primary" className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2">
            <PlusCircle size={18} /> Create New Project
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

      {/* KPI Stats */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={3}>
          <StatCard
            title="Total Projects"
            value={stats.total_projects}
            icon={FolderKanban}
            color="primary"
            subtitle="Registered software projects"
          />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard
            title="Under Review"
            value={stats.under_review_projects}
            icon={Clock}
            color="indigo"
            subtitle="Awaiting faculty assessment"
          />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard
            title="Changes Required"
            value={stats.changes_required_projects}
            icon={AlertTriangle}
            color="warning"
            subtitle="Revisions requested by reviewer"
          />
        </Col>
        <Col sm={6} lg={3}>
          <StatCard
            title="Approved"
            value={stats.approved_projects}
            icon={CheckCircle2}
            color="success"
            subtitle="Passed stage reviews"
          />
        </Col>
      </Row>

      {/* Main Grid */}
      <Row className="g-4">
        {/* Left Column: Projects & Evaluations */}
        <Col lg={8}>
          {/* Active Projects */}
          <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-0">My Projects</h5>
                <span className="text-muted small">Projects where you are creator or team member</span>
              </div>
              <Link to="/student/projects" className="small fw-semibold text-primary text-decoration-none">
                View All
              </Link>
            </Card.Header>
            <Card.Body className="p-4">
              {activeProjects.length === 0 ? (
                <div className="text-center py-5">
                  <div className="bg-light p-3 rounded-circle d-inline-flex mb-3">
                    <FolderKanban size={32} className="text-muted" />
                  </div>
                  <h6 className="fw-bold text-dark">No projects registered yet</h6>
                  <p className="text-muted small mb-3">Get started by creating your software project proposal.</p>
                  <Button as={Link} to="/student/projects/create" variant="primary" size="sm" className="rounded-pill px-3">
                    Create Project
                  </Button>
                </div>
              ) : (
                <Row className="g-3">
                  {activeProjects.map((p) => (
                    <Col md={6} key={p.id}>
                      <ProjectCard project={p} linkPrefix="/student/projects" />
                    </Col>
                  ))}
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Recent Evaluations & Feedback */}
          <Card className="border-0 shadow-sm rounded-4 bg-white">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
              <h5 className="fw-bold text-dark mb-0">Recent Review Evaluations</h5>
              <span className="text-muted small">Latest marks awarded and reviewer comments</span>
            </Card.Header>
            <Card.Body className="p-4">
              {recentEvaluations.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No evaluations recorded yet. Reviews will appear here once faculty assesses your project.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {recentEvaluations.map((rev) => (
                    <div key={rev.id} className="p-3 border rounded-3 bg-light">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <h6 className="fw-bold text-dark mb-1">{rev.project_title}</h6>
                          <div className="small text-muted">
                            <span className="fw-medium text-primary">{rev.stage_name}</span> • Evaluated by {rev.reviewer_name}
                          </div>
                        </div>
                        <div className="text-end">
                          <StatusBadge status={rev.decision} />
                          <div className="fw-bold text-dark mt-1">
                            {rev.total_marks} / 100 <span className="text-muted small">({rev.percentage}%)</span>
                          </div>
                        </div>
                      </div>
                      {rev.feedback && (
                        <div className="bg-white p-2.5 rounded-2 border text-muted small mt-2">
                          <strong>Comments: </strong> {rev.feedback}
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center mt-2 pt-1">
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Submitted: {formatDateTime(rev.submitted_at)}
                        </span>
                        <Link to={`/student/projects/${rev.project_id}`} className="small text-decoration-none fw-semibold">
                          View Breakdown Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Upcoming Schedules & Quick Tips */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0">Review Sessions</h5>
              <Link to="/student/schedules" className="small fw-semibold text-primary text-decoration-none">
                Calendar
              </Link>
            </Card.Header>
            <Card.Body className="p-4">
              {upcomingSchedules.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No upcoming reviews currently scheduled.
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {upcomingSchedules.map((s) => (
                    <div key={s.id} className="p-3 border rounded-3 border-start border-4 border-primary bg-light">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="badge bg-primary bg-opacity-10 text-primary small">{s.stage_name}</span>
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

          {/* Guidelines Box */}
          <Card className="border-0 shadow-sm rounded-4 bg-white p-3">
            <Card.Body>
              <h6 className="fw-bold text-dark mb-2">Review Preparation Tips</h6>
              <ul className="text-muted small ps-3 mb-0 d-flex flex-column gap-2">
                <li>Ensure all code archives and PDF reports are uploaded 24 hours prior.</li>
                <li>Review the specific 5 criteria for your active review stage.</li>
                <li>If reviewer requests changes, update project objectives and resubmit promptly.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentDashboard;
