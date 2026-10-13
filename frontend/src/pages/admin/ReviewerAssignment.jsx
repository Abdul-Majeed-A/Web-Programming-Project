import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { UserCheck, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const ReviewerAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedProject, setSelectedProject] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [assignRes, projRes, facRes] = await Promise.all([
        api.get('/assignments'),
        api.get('/projects'),
        api.get('/users/faculty'),
      ]);

      if (assignRes.data.success) setAssignments(assignRes.data.data);
      if (projRes.data.success) setProjects(projRes.data.data);
      if (facRes.data.success) setFaculty(facRes.data.data);
    } catch (err) {
      setError('Failed to load assignment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedFaculty) {
      setError('Please select both a project and a faculty reviewer.');
      return;
    }

    setAssigning(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/assignments', {
        project_id: Number(selectedProject),
        faculty_id: Number(selectedFaculty),
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setSelectedProject('');
        setSelectedFaculty('');
        fetchData();
      } else {
        setError(res.data.message || 'Failed to assign reviewer.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error assigning reviewer.');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async (assignmentId) => {
    if (!window.confirm('Remove this faculty reviewer from the project?')) return;
    try {
      const res = await api.delete(`/assignments/${assignmentId}`);
      if (res.data.success) {
        setMessage('Assignment removed successfully.');
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove assignment.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading assignment panels..." />;

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Assign Faculty Reviewers
        </h3>
        <p className="text-muted small mb-0">Designate faculty review panels to evaluate student project proposals and milestone defenses.</p>
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

      {/* Assignment Creator Box */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-4">
        <Card.Body className="p-0">
          <h5 className="fw-bold text-dark mb-3">Create New Assignment</h5>
          <Form onSubmit={handleAssign}>
            <Row className="gy-3 align-items-end">
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Select Project *</Form.Label>
                  <Form.Select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    required
                    className="py-2"
                  >
                    <option value="">-- Choose Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        #{p.id} - {p.title} ({p.status})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={5}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-muted">Select Faculty Reviewer *</Form.Label>
                  <Form.Select
                    value={selectedFaculty}
                    onChange={(e) => setSelectedFaculty(e.target.value)}
                    required
                    className="py-2"
                  >
                    <option value="">-- Choose Reviewer --</option>
                    {faculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.full_name} ({f.department})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={assigning}
                  className="w-100 py-2 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                >
                  <UserCheck size={16} /> {assigning ? 'Assigning...' : 'Assign'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Existing Assignments Table */}
      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Header className="bg-transparent border-0 pt-4 px-4 pb-0">
          <h5 className="fw-bold text-dark mb-0">Active Project Reviewer Assignments</h5>
          <span className="text-muted small">Current faculty assignments recorded in database</span>
        </Card.Header>
        <Card.Body className="p-4">
          {assignments.length === 0 ? (
            <div className="text-center py-4 text-muted small">
              No faculty reviewers assigned to any projects yet.
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Assigned Faculty</th>
                  <th>Department</th>
                  <th>Assigned By</th>
                  <th>Date Assigned</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div className="fw-bold text-dark">#{a.project_id} - {a.project_title}</div>
                      <Badge bg="light" text="dark" className="border px-2 py-0.5 mt-1">{a.project_status}</Badge>
                    </td>
                    <td>{a.project_category}</td>
                    <td>
                      <div className="fw-semibold text-primary">{a.faculty_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>{a.faculty_email}</div>
                    </td>
                    <td>{a.faculty_department}</td>
                    <td>{a.assigned_by_name}</td>
                    <td>{formatDate(a.assigned_at)}</td>
                    <td className="text-end">
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="rounded-pill p-1.5"
                        onClick={() => handleRemove(a.id)}
                        title="Remove Assignment"
                      >
                        <Trash2 size={15} />
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

export default ReviewerAssignment;
