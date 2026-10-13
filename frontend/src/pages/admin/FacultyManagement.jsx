import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, InputGroup, Badge, Row, Col, Modal, Alert } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { Search, UserPlus, Users, CheckCircle } from 'lucide-react';

const FacultyManagement = () => {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add Faculty Modal
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    full_name: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering',
    student_or_faculty_identifier: '',
  });
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState('');
  const [message, setMessage] = useState('');

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
  ];

  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/users/faculty', { params });
      if (res.data.success) {
        setFaculty(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [deptFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFaculty();
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/users/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        setMessage(`Faculty account ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
        fetchFaculty();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update account status.');
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setCreating(true);
    setModalError('');

    try {
      const res = await api.post('/users', {
        ...modalForm,
        role: 'faculty',
      });
      if (res.data.success) {
        setShowModal(false);
        setMessage(`Faculty member ${res.data.user.full_name} registered successfully.`);
        setModalForm({
          full_name: '',
          email: '',
          password: '',
          department: 'Computer Science & Engineering',
          student_or_faculty_identifier: '',
        });
        fetchFaculty();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to register faculty account.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Faculty Reviewer Management
          </h3>
          <p className="text-muted small mb-0">Manage faculty review panels, departmental affiliations, and assign workloads.</p>
        </div>
        <div>
          <Button variant="primary" className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
            <UserPlus size={18} /> Register Faculty Member
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')} className="rounded-3 mb-4">
          <CheckCircle size={16} className="me-2 d-inline" /> {message}
        </Alert>
      )}

      {/* Filter and Search Box */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3">
        <Card.Body className="p-2">
          <Row className="gy-3">
            <Col lg={4}>
              <Form onSubmit={handleSearchSubmit}>
                <InputGroup>
                  <InputGroup.Text className="bg-light border-end-0">
                    <Search size={16} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search name, faculty ID, email..."
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

            <Col sm={6} lg={4}>
              <Form.Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Form.Select>
            </Col>

            <Col sm={6} lg={4}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Account Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner text="Loading faculty reviewers..." />
          ) : faculty.length === 0 ? (
            <div className="text-center py-5">
              <Users size={36} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark">No faculty accounts found</h6>
              <p className="text-muted small mb-0">Click "Register Faculty Member" to onboard reviewers.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th className="ps-4">Faculty Name</th>
                  <th>Faculty ID</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Assigned Projects</th>
                  <th>Status</th>
                  <th>Added Date</th>
                  <th className="pe-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {faculty.map((f) => (
                  <tr key={f.id}>
                    <td className="ps-4 fw-semibold text-dark">{f.full_name}</td>
                    <td><Badge bg="light" text="dark" className="border px-2 py-1">{f.student_or_faculty_identifier || 'N/A'}</Badge></td>
                    <td className="text-muted">{f.email}</td>
                    <td>{f.department}</td>
                    <td>
                      <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
                        {f.assigned_project_count || 0} projects
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={f.account_status === 'active' ? 'success' : 'danger'} pill className="px-2.5 py-1 text-capitalize">
                        {f.account_status}
                      </Badge>
                    </td>
                    <td>{formatDate(f.created_at)}</td>
                    <td className="pe-4 text-end">
                      <Button
                        variant={f.account_status === 'active' ? 'outline-danger' : 'outline-success'}
                        size="sm"
                        className="rounded-pill px-3 py-1"
                        onClick={() => handleToggleStatus(f.id, f.account_status)}
                      >
                        {f.account_status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Faculty Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Register New Faculty Reviewer</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateFaculty}>
          <Modal.Body>
            {modalError && <Alert variant="danger" className="small py-2">{modalError}</Alert>}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Full Name *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Dr. Ramesh Sharma"
                value={modalForm.full_name}
                onChange={(e) => setModalForm({ ...modalForm, full_name: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Email Address *</Form.Label>
              <Form.Control
                type="email"
                placeholder="dr.sharma@projectpulse.edu"
                value={modalForm.email}
                onChange={(e) => setModalForm({ ...modalForm, email: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Faculty ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="FAC-CSE-101"
                    value={modalForm.student_or_faculty_identifier}
                    onChange={(e) => setModalForm({ ...modalForm, student_or_faculty_identifier: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-muted">Initial Password *</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Faculty@123"
                    value={modalForm.password}
                    onChange={(e) => setModalForm({ ...modalForm, password: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-muted">Department *</Form.Label>
              <Form.Select
                value={modalForm.department}
                onChange={(e) => setModalForm({ ...modalForm, department: e.target.value })}
                required
              >
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={creating} className="rounded-pill">
              {creating ? 'Registering...' : 'Register Faculty'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyManagement;
