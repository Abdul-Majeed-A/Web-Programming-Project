import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, InputGroup, Badge, Row, Col, Alert } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';
import { Search, GraduationCap, CheckCircle, XCircle } from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [message, setMessage] = useState('');

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
  ];

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/users/students', { params });
      if (res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [deptFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const res = await api.put(`/users/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        setMessage(`Student account ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully.`);
        fetchStudents();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update account status.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Student Accounts Management
        </h3>
        <p className="text-muted small mb-0">Monitor registered student profiles, departmental affiliations, and account activation states.</p>
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
                    placeholder="Search name, roll no, email..."
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
            <LoadingSpinner text="Loading student accounts..." />
          ) : students.length === 0 ? (
            <div className="text-center py-5">
              <GraduationCap size={36} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark">No student accounts found</h6>
              <p className="text-muted small mb-0">Try clearing search filters.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th className="ps-4">Student Name</th>
                  <th>Roll / Identifier</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th className="pe-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="ps-4 fw-semibold text-dark">{s.full_name}</td>
                    <td><Badge bg="light" text="dark" className="border px-2 py-1">{s.student_or_faculty_identifier || 'N/A'}</Badge></td>
                    <td className="text-muted">{s.email}</td>
                    <td>{s.department}</td>
                    <td>
                      <Badge bg={s.account_status === 'active' ? 'success' : 'danger'} pill className="px-2.5 py-1 text-capitalize">
                        {s.account_status}
                      </Badge>
                    </td>
                    <td>{formatDate(s.created_at)}</td>
                    <td className="pe-4 text-end">
                      <Button
                        variant={s.account_status === 'active' ? 'outline-danger' : 'outline-success'}
                        size="sm"
                        className="rounded-pill px-3 py-1"
                        onClick={() => handleToggleStatus(s.id, s.account_status)}
                      >
                        {s.account_status === 'active' ? 'Deactivate' : 'Activate'}
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

export default StudentManagement;
