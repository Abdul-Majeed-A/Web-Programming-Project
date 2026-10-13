import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, User, Mail, Lock, Building, CreditCard, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    department: 'Computer Science & Engineering',
    student_or_faculty_identifier: '',
  });

  const [loading, setLoading] = useState(false);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await register({
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        department: formData.department,
        student_or_faculty_identifier: formData.student_or_faculty_identifier,
      });

      if (res.success) {
        navigate('/student/dashboard');
      } else {
        setError(res.message || 'Registration failed. Please check your details.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 150px)' }}>
      <Container className="py-3">
        <Row className="justify-content-center">
          <Col md={8} lg={7} xl={6}>
            <div className="text-center mb-4">
              <div className="bg-primary text-white p-2.5 rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow-sm">
                <Activity size={26} />
              </div>
              <h2 className="fw-extrabold text-dark" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Student Registration
              </h2>
              <p className="text-muted small">Create your student account to register projects and track reviews</p>
            </div>

            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
              <Card.Body>
                {error && (
                  <Alert variant="danger" className="small py-2 rounded-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
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
                        placeholder="e.g. Aarav Mehta"
                        required
                        className="border-start-0 py-2"
                      />
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-muted">Institutional Email</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Mail size={16} className="text-muted" />
                          </span>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="student@projectpulse.edu"
                            required
                            className="border-start-0 py-2"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
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
                            placeholder="STU-2023-CS-042"
                            required
                            className="border-start-0 py-2"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold text-muted">Academic Department</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <Building size={16} className="text-muted" />
                      </span>
                      <Form.Select
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        className="border-start-0 py-2"
                        required
                      >
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </Form.Group>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="small fw-semibold text-muted">Password</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Lock size={16} className="text-muted" />
                          </span>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="border-start-0 py-2"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-4">
                        <Form.Label className="small fw-semibold text-muted">Confirm Password</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0">
                            <Lock size={16} className="text-muted" />
                          </span>
                          <Form.Control
                            type="password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="border-start-0 py-2"
                          />
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 py-2.5 rounded-pill fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                  >
                    {loading ? 'Creating Account...' : 'Register Account'} <ArrowRight size={16} />
                  </Button>
                </Form>

                <div className="text-center pt-2 border-top">
                  <span className="text-muted small">Already have an account? </span>
                  <Link to="/login" className="small fw-semibold text-primary text-decoration-none">
                    Log in here
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
