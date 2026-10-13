import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axiosInstance';
import { User, Mail, Building, CreditCard, Lock, Save, CheckCircle } from 'lucide-react';

const StudentProfile = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    department: user?.department || '',
    student_or_faculty_identifier: user?.student_or_faculty_identifier || '',
    new_password: '',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/users/profile', formData);
      if (res.data.success) {
        updateUser(res.data.user);
        setSuccess('Profile updated successfully.');
        setFormData((prev) => ({ ...prev, new_password: '' }));
      } else {
        setError(res.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          My Student Profile
        </h3>
        <p className="text-muted small mb-0">View and update your academic details and account password.</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <Card.Body>
              {success && (
                <Alert variant="success" className="small py-2 rounded-3 mb-4">
                  <CheckCircle size={16} className="me-2 d-inline" /> {success}
                </Alert>
              )}
              {error && <Alert variant="danger" className="small py-2 rounded-3 mb-4">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row className="gy-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted">Full Name</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <User size={16} className="text-muted" />
                        </span>
                        <Form.Control
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          required
                          className="py-2 border-start-0"
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted">Email Address (Read Only)</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <Mail size={16} className="text-muted" />
                        </span>
                        <Form.Control
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="py-2 border-start-0 bg-light"
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted">Roll Number / Student ID</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <CreditCard size={16} className="text-muted" />
                        </span>
                        <Form.Control
                          type="text"
                          name="student_or_faculty_identifier"
                          value={formData.student_or_faculty_identifier}
                          onChange={handleChange}
                          className="py-2 border-start-0"
                        />
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted">Department</Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <Building size={16} className="text-muted" />
                        </span>
                        <Form.Select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="py-2 border-start-0"
                        >
                          {departments.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </Form.Select>
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <div className="border-top pt-3 mt-2">
                      <Form.Group>
                        <Form.Label className="small fw-semibold text-muted">Change Password (Leave blank to keep current)</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Lock size={16} className="text-muted" />
                          </span>
                          <Form.Control
                            type="password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            placeholder="Enter new password (optional)"
                            className="py-2 border-start-0"
                          />
                        </div>
                      </Form.Group>
                    </div>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving}
                    className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
                  >
                    <Save size={16} /> {saving ? 'Saving...' : 'Update Profile'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StudentProfile;
