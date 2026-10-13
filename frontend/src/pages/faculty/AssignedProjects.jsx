import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, InputGroup, Badge, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { Search, FolderKanban, CheckCircle, FileText, ArrowRight } from 'lucide-react';

const AssignedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get('/projects', { params });
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch assigned projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Assigned Projects for Review
        </h3>
        <p className="text-muted small mb-0">Evaluate student software project milestones, grade criteria, and offer feedback.</p>
      </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3">
        <Card.Body className="p-2">
          <Row className="gy-3 align-items-center">
            <Col lg={6}>
              <div className="d-flex flex-wrap gap-1.5">
                {['All', 'Under Review', 'Submitted', 'Changes Required', 'Resubmitted', 'Approved'].map((st) => (
                  <Button
                    key={st}
                    variant={statusFilter === st ? 'primary' : 'light'}
                    size="sm"
                    className="rounded-pill px-3 py-1.5 text-capitalize"
                    onClick={() => setStatusFilter(st)}
                  >
                    {st}
                  </Button>
                ))}
              </div>
            </Col>
            <Col lg={6}>
              <Form onSubmit={handleSearchSubmit}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0">
                    <Search size={16} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search by project title, student name..."
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
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner text="Loading assigned projects..." />
          ) : projects.length === 0 ? (
            <div className="text-center py-5">
              <FolderKanban size={36} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark">No assigned projects found</h6>
              <p className="text-muted small mb-0">Projects assigned to your faculty account will appear here.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th className="ps-4">Project Title</th>
                  <th>Category</th>
                  <th>Team Lead</th>
                  <th>Current Review Stage</th>
                  <th>Lifecycle Status</th>
                  <th>Last Updated</th>
                  <th className="pe-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {projects.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4">
                      <div className="fw-bold text-dark">{p.title}</div>
                      <div className="text-muted text-truncate" style={{ maxWidth: '240px', fontSize: '0.72rem' }}>
                        {p.technology_stack}
                      </div>
                    </td>
                    <td>
                      <Badge bg="light" text="dark" className="border px-2.5 py-1">
                        {p.category}
                      </Badge>
                    </td>
                    <td>{p.creator_name}</td>
                    <td>
                      <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
                        {p.stage_name}
                      </span>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{formatDate(p.updated_at)}</td>
                    <td className="pe-4 text-end">
                      <Button
                        as={Link}
                        to={`/faculty/review/${p.id}`}
                        variant="primary"
                        size="sm"
                        className="rounded-pill px-3 shadow-xs d-inline-flex align-items-center gap-1"
                      >
                        Evaluate <ArrowRight size={14} />
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

export default AssignedProjects;
