import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  GraduationCap,
  FolderKanban,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  UserCheck,
  CalendarDays,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

// Chart.js imports & registration
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load administrator metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Compiling university-wide project metrics..." />;

  const stats = data?.stats || {};
  const statusDist = data?.statusDistribution || [];
  const stageDist = data?.stageDistribution || [];
  const deptDist = data?.departmentDistribution || [];
  const recentProjects = data?.recentProjects || [];

  // Chart 1: Status Breakdown (Doughnut)
  const statusLabels = statusDist.map((s) => s.status);
  const statusCounts = statusDist.map((s) => s.count);
  const doughnutData = {
    labels: statusLabels.length > 0 ? statusLabels : ['No Data'],
    datasets: [
      {
        data: statusCounts.length > 0 ? statusCounts : [1],
        backgroundColor: [
          '#10b981', // Approved
          '#3b82f6', // Under Review
          '#f59e0b', // Changes Required
          '#8b5cf6', // Submitted / Resubmitted
          '#ef4444', // Rejected
          '#94a3b8', // Draft
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Chart 2: Stage Distribution (Bar)
  const stageLabels = stageDist.map((stg) => stg.stage_name.replace('Review ', 'R'));
  const stageCounts = stageDist.map((stg) => stg.count);
  const barData = {
    labels: stageLabels.length > 0 ? stageLabels : ['Stage 1', 'Stage 2', 'Stage 3'],
    datasets: [
      {
        label: 'Active Projects in Stage',
        data: stageCounts.length > 0 ? stageCounts : [0, 0, 0],
        backgroundColor: '#2563eb',
        borderRadius: 8,
      },
    ],
  };

  return (
    <div>
      {/* Top Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Administrator Executive Dashboard
          </h3>
          <p className="text-muted small mb-0">Institutional project oversight, reviewer assignments, and evaluations governance.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Button as={Link} to="/admin/assignments" variant="primary" className="rounded-pill px-3.5 shadow-sm d-flex align-items-center gap-1.5">
            <UserCheck size={16} /> Assign Reviewers
          </Button>
          <Button as={Link} to="/admin/schedules" variant="outline-primary" className="rounded-pill px-3.5 d-flex align-items-center gap-1.5">
            <CalendarDays size={16} /> Schedule Session
          </Button>
        </div>
      </div>

      {error && <Alert variant="danger" className="rounded-3">{error}</Alert>}

      {/* KPI Stats Grid */}
      <Row className="g-3 mb-4">
        <Col sm={6} lg={2}>
          <StatCard
            title="Total Projects"
            value={stats.total_projects}
            icon={FolderKanban}
            color="primary"
          />
        </Col>
        <Col sm={6} lg={2}>
          <StatCard
            title="Students"
            value={stats.total_students}
            icon={GraduationCap}
            color="indigo"
          />
        </Col>
        <Col sm={6} lg={2}>
          <StatCard
            title="Faculty Reviewers"
            value={stats.total_faculty}
            icon={Users}
            color="purple"
          />
        </Col>
        <Col sm={6} lg={2}>
          <StatCard
            title="Awaiting Review"
            value={stats.awaiting_review}
            icon={Clock}
            color="warning"
          />
        </Col>
        <Col sm={6} lg={2}>
          <StatCard
            title="Approved"
            value={stats.approved_projects}
            icon={CheckCircle2}
            color="success"
          />
        </Col>
        <Col sm={6} lg={2}>
          <StatCard
            title="Rejected"
            value={stats.rejected_projects}
            icon={XCircle}
            color="danger"
          />
        </Col>
      </Row>

      {/* Analytics Charts Row */}
      <Row className="g-4 mb-4">
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white p-3">
            <Card.Header className="bg-transparent border-0 pt-2 px-2 pb-0">
              <h5 className="fw-bold text-dark mb-0 fs-6">Project Status Distribution</h5>
              <span className="text-muted small">Lifecycle breakdown across student submissions</span>
            </Card.Header>
            <Card.Body className="p-3 d-flex align-items-center justify-content-center" style={{ minHeight: '260px' }}>
              <div style={{ maxWidth: '280px', width: '100%' }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-4 h-100 bg-white p-3">
            <Card.Header className="bg-transparent border-0 pt-2 px-2 pb-0">
              <h5 className="fw-bold text-dark mb-0 fs-6">Review Stage Cohorts</h5>
              <span className="text-muted small">Distribution of active projects across Proposal, Progress, and Final stages</span>
            </Card.Header>
            <Card.Body className="p-3 d-flex align-items-center" style={{ minHeight: '260px' }}>
              <div className="w-100" style={{ height: '230px' }}>
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { beginAtZero: true, ticks: { precision: 0 } },
                      x: { grid: { display: false } },
                    },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Projects Table & Department Breakdown */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
            <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold text-dark mb-0">Recently Registered Projects</h5>
                <span className="text-muted small">Latest student project submissions</span>
              </div>
              <Link to="/admin/projects" className="small fw-semibold text-primary text-decoration-none">
                All Projects
              </Link>
            </Card.Header>
            <Card.Body className="p-4">
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light small text-uppercase text-muted">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Student Lead</th>
                    <th>Stage</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {recentProjects.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-semibold text-dark">{p.title}</td>
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
                        <Link to={`/admin/projects/${p.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 bg-white p-3">
            <Card.Header className="bg-transparent border-0 pt-2 px-2 pb-0">
              <h5 className="fw-bold text-dark mb-0 fs-6">Department Participation</h5>
              <span className="text-muted small">Project count by academic discipline</span>
            </Card.Header>
            <Card.Body className="p-2 pt-3">
              {deptDist.length === 0 ? (
                <p className="text-muted small">No department data available.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {deptDist.map((dept, idx) => (
                    <div key={idx} className="p-2.5 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                      <span className="fw-semibold text-dark small text-truncate" style={{ maxWidth: '200px' }}>
                        {dept.department}
                      </span>
                      <span className="badge bg-primary rounded-pill px-2.5 py-1">
                        {dept.project_count} projects
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-3 border-top">
                <Button as={Link} to="/admin/reports" variant="outline-primary" size="sm" className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-1.5">
                  <BarChart3 size={15} /> Export Reports to CSV
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;
