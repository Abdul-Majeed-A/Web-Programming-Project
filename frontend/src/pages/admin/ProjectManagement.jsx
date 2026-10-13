import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, InputGroup, Badge, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { Search, FolderKanban, ArrowRight, UserCheck } from 'lucide-react';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const statuses = ['All', 'Draft', 'Submitted', 'Under Review', 'Changes Required', 'Resubmitted', 'Approved', 'Rejected'];

  const categories = [
    'All Categories',
    'Web Development',
    'Artificial Intelligence & Machine Learning',
    'Mobile Application Development',
    'Internet of Things (IoT)',
    'Blockchain & Cybersecurity',
    'Cloud Computing & DevOps',
    'Robotics & Automation',
  ];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      if (categoryFilter && categoryFilter !== 'All Categories') params.category = categoryFilter;

      const res = await api.get('/projects', { params });
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            All University Software Projects
          </h3>
          <p className="text-muted small mb-0">Centralized governance for all student project proposals, reviews, and evaluations.</p>
        </div>
        <div>
          <Button as={Link} to="/admin/assignments" variant="primary" className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2">
            <UserCheck size={18} /> Assign Reviewers
          </Button>
        </div>
      </div>

      {/* Filter and Search Box */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3">
        <Card.Body className="p-2">
          <Row className="gy-3">
            <Col lg={5}>
              <Form onSubmit={handleSearchSubmit}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0">
                    <Search size={16} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by title, technology stack, student..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0"
                  />
                  <Button variant="outline-primary" type="submit">
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>

            <Col sm={6} lg={3.5}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Lifecycle Statuses</option>
                {statuses.filter((s) => s !== 'All').map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </Form.Select>
            </Col>

            <Col sm={6} lg={3.5}>
              <Form.Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner text="Loading university projects..." />
          ) : projects.length === 0 ? (
            <div className="text-center py-5">
              <FolderKanban size={36} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark">No projects match query</h6>
              <p className="text-muted small mb-0">Try clearing filters.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th className="ps-4">Title</th>
                  <th>Category</th>
                  <th>Student Lead</th>
                  <th>Current Stage</th>
                  <th>Assigned Reviewers</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="pe-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{p.title}</div>
                      <div className="text-muted text-truncate" style={{ maxWidth: '220px', fontSize: '0.72rem' }}>
                        {p.technology_stack}
                      </div>
                    </td>
                    <td><Badge bg="light" text="dark" className="border px-2 py-1">{p.category}</Badge></td>
                    <td>{p.creator_name}</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
                        {p.stage_name}
                      </span>
                    </td>
                    <td className="text-muted small">
                      {p.assigned_faculty_names || <span className="text-warning">Unassigned</span>}
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{formatDate(p.created_at)}</td>
                    <td className="pe-4 text-end">
                      <Link to={`/admin/projects/${p.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 d-inline-flex align-items-center gap-1">
                        Details <ArrowRight size={14} />
                      </Link>
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

export default ProjectManagement;
