import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const isExpired = searchParams.get('expired');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleDemoFill = (email, password) => {
    setFormData({ email, password });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        const userRole = res.user.role;
        if (userRole === 'admin') navigate('/admin/dashboard');
        else if (userRole === 'faculty') navigate('/faculty/dashboard');
        else navigate('/student/dashboard');
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to the server. Please verify MySQL and backend are running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5" style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 150px)' }}>
      <Container className="py-3">
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <div className="text-center mb-4">
              <div className="bg-primary text-white p-2.5 rounded-3 d-inline-flex align-items-center justify-content-center mb-2 shadow-sm">
                <Activity size={26} />
              </div>
              <h2 className="fw-extrabold text-dark" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Sign In to Project<span className="text-primary">Pulse</span>
              </h2>
              <p className="text-muted small">Access your student, faculty reviewer, or admin portal</p>
            </div>

            <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
              <Card.Body>
                {isExpired && (
                  <Alert variant="warning" className="small py-2 rounded-3">
                    Your session has expired. Please log in again to continue.
                  </Alert>
                )}

                {error && (
                  <Alert variant="danger" className="small py-2 rounded-3">
                    {error}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
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
                        placeholder="name@projectpulse.edu"
                        required
                        className="border-start-0 py-2"
                      />
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <Form.Label className="small fw-semibold text-muted mb-1">Password</Form.Label>
                    </div>
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

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="w-100 py-2.5 rounded-pill fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2 mb-3"
                  >
                    {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={16} />
                  </Button>
                </Form>

                <div className="text-center pt-2 border-top">
                  <span className="text-muted small">New student? </span>
                  <Link to="/register" className="small fw-semibold text-primary text-decoration-none">
                    Register an account
                  </Link>
                </div>
              </Card.Body>
            </Card>

            {/* One-Click Demo Credentials Box */}
            <Card className="border-0 shadow-sm rounded-4 mt-4 bg-white p-3 border-top border-4 border-primary">
              <Card.Body className="p-2">
                <h6 className="fw-bold text-dark mb-2 text-center small text-uppercase tracking-wider">
                  Quick Demo Accounts (Click to Fill)
                </h6>
                <div className="d-flex flex-column gap-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="rounded-3 d-flex align-items-center justify-content-between py-2 px-3 text-start"
                    onClick={() => handleDemoFill('admin@projectpulse.edu', 'Admin@123')}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <ShieldCheck size={16} />
                      <div>
                        <div className="fw-semibold small">Administrator</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>admin@projectpulse.edu (Admin@123)</div>
                      </div>
                    </div>
                    <span className="badge bg-danger bg-opacity-10 text-danger small">Admin</span>
                  </Button>

                  <Button
                    variant="outline-info"
                    size="sm"
                    className="rounded-3 d-flex align-items-center justify-content-between py-2 px-3 text-start"
                    onClick={() => handleDemoFill('dr.sharma@projectpulse.edu', 'Faculty@123')}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <UserCheck size={16} />
                      <div>
                        <div className="fw-semibold small">Faculty Reviewer</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>dr.sharma@projectpulse.edu (Faculty@123)</div>
                      </div>
                    </div>
                    <span className="badge bg-info bg-opacity-10 text-info small">Faculty</span>
                  </Button>

                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="rounded-3 d-flex align-items-center justify-content-between py-2 px-3 text-start"
                    onClick={() => handleDemoFill('student1@projectpulse.edu', 'Student@123')}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <GraduationCap size={16} />
                      <div>
                        <div className="fw-semibold small">Student Lead</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>student1@projectpulse.edu (Student@123)</div>
                      </div>
                    </div>
                    <span className="badge bg-primary bg-opacity-10 text-primary small">Student</span>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
