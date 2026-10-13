import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, InputGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import ProjectCard from '../../components/ProjectCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { PlusCircle, Search, Filter, FolderKanban } from 'lucide-react';

const MyProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const statuses = ['All', 'Draft', 'Submitted', 'Under Review', 'Changes Required', 'Resubmitted', 'Approved', 'Rejected'];

  const fetchProjects = async () => {
    setLoading(true);
    try {
      let url = '/projects';
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get(url, { params });
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch student projects:', err);
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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            My Projects
          </h3>
          <p className="text-muted small mb-0">Manage your active, submitted, and completed academic software projects.</p>
        </div>
        <div>
          <Button as={Link} to="/student/projects/create" variant="primary" className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2">
            <PlusCircle size={18} /> Create New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3">
        <Card.Body className="p-2">
          <Row className="gy-3 align-items-center">
            <Col lg={6}>
              <div className="d-flex flex-wrap gap-1.5">
                {statuses.map((st) => (
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
                    placeholder="Search by title, technology stack..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border-start-0"
                  />
                  <Button variant="outline-primary" type="submit" className="rounded-end">
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Projects Grid */}
      {loading ? (
        <LoadingSpinner text="Loading projects..." />
      ) : projects.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5 bg-white">
          <Card.Body>
            <div className="bg-light p-3 rounded-circle d-inline-flex mb-3">
              <FolderKanban size={36} className="text-muted" />
            </div>
            <h5 className="fw-bold text-dark">No projects match your filter</h5>
            <p className="text-muted small mb-3">Try clearing search parameters or create a new project proposal.</p>
            <Button as={Link} to="/student/projects/create" variant="primary" className="rounded-pill px-4">
              Create New Project
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {projects.map((proj) => (
            <Col md={6} lg={4} key={proj.id}>
              <ProjectCard project={proj} linkPrefix="/student/projects" />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default MyProjects;
