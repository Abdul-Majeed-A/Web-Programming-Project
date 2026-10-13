import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  UserCheck,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Layers,
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="py-5 py-lg-6 hero-section position-relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)' }}>
        <Container className="py-4">
          <Row className="align-items-center gy-5">
            <Col lg={7}>
              <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fw-semibold mb-3 d-inline-flex align-items-center gap-1.5">
                <Sparkles size={15} /> Centralized Academic Evaluation Platform
              </Badge>
              <h1 className="display-4 fw-extrabold text-dark tracking-tight mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Manage, Review and <span className="text-primary">Improve Student Projects</span>
              </h1>
              <p className="lead text-secondary mb-4 pe-lg-4" style={{ fontSize: '1.2rem', lineHeight: '1.7' }}>
                ProjectPulse digitizes the entire lifecycle of university software projects—from student registration and proposal submission to faculty milestone assessments, multi-stage rubrics, and automated performance analytics.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Button as={Link} to={getDashboardLink()} variant="primary" size="lg" className="rounded-pill px-4 py-2.5 shadow-sm d-flex align-items-center gap-2">
                    Open Your Dashboard <ArrowRight size={18} />
                  </Button>
                ) : (
                  <>
                    <Button as={Link} to="/register" variant="primary" size="lg" className="rounded-pill px-4 py-2.5 shadow-sm d-flex align-items-center gap-2">
                      Get Started (Student) <ArrowRight size={18} />
                    </Button>
                    <Button as={Link} to="/login" variant="outline-primary" size="lg" className="rounded-pill px-4 py-2.5">
                      Portal Login
                    </Button>
                  </>
                )}
              </div>

              {/* Fast trust highlights */}
              <div className="d-flex flex-wrap gap-4 mt-5 pt-3 border-top text-muted small">
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={18} className="text-success" /> 3-Stage Rubrics
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={18} className="text-success" /> Automated Scoring
                </div>
                <div className="d-flex align-items-center gap-2">
                  <CheckCircle2 size={18} className="text-success" /> Role-Based Security
                </div>
              </div>
            </Col>

            <Col lg={5}>
              <div className="position-relative">
                <div className="card border-0 shadow-lg rounded-4 p-4 bg-white position-relative z-index-1">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill fw-semibold">Live Review Demo</span>
                    <span className="text-success fw-semibold small d-flex align-items-center gap-1">
                      <span className="p-1 bg-success rounded-circle d-inline-block"></span> Stage 2 Active
                    </span>
                  </div>
                  <h5 className="fw-bold mb-1">AI Medical Image Diagnostic Assistant</h5>
                  <p className="text-muted small mb-3">Dept. of Computer Science & Engineering</p>

                  <div className="bg-light p-3 rounded-3 mb-3 border">
                    <div className="d-flex justify-content-between small fw-medium mb-1">
                      <span>Review 1: Proposal Review</span>
                      <span className="text-success fw-bold">88 / 100 Marks</span>
                    </div>
                    <div className="d-flex justify-content-between small fw-medium mb-1">
                      <span>Review 2: Progress Review</span>
                      <span className="text-primary fw-bold">Scheduled (18-Oct)</span>
                    </div>
                    <div className="d-flex justify-content-between small text-muted">
                      <span>Review 3: Final Demo</span>
                      <span>Pending</span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-2">
                    <div className="d-flex align-items-center gap-2">
                      <div className="bg-primary text-white rounded-circle p-1.5 small fw-bold" style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        DS
                      </div>
                      <span className="small text-muted">Dr. Ramesh Sharma (Reviewer)</span>
                    </div>
                    <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1">Approved</span>
                  </div>
                </div>

                {/* Decorative blob behind card */}
                <div
                  className="position-absolute rounded-circle"
                  style={{
                    width: '320px',
                    height: '320px',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, rgba(37,99,235,0) 70%)',
                    top: '-40px',
                    right: '-40px',
                    zIndex: 0,
                  }}
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Feature Cards Section */}
      <section className="py-5 bg-white">
        <Container className="py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-wider">Features & Capabilities</h6>
            <h2 className="fw-bold text-dark display-6">Everything You Need for Seamless Reviews</h2>
            <p className="text-muted">
              Designed specifically for engineering institutions to eliminate fragmented spreadsheets and chaotic paper evaluations.
            </p>
          </div>

          <Row className="gy-4">
            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3 feature-card">
                <Card.Body>
                  <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3 d-inline-flex mb-3">
                    <FileText size={24} />
                  </div>
                  <h5 className="fw-bold mb-2">Project Submission</h5>
                  <p className="text-muted small mb-0">
                    Students define titles, objectives, technology stacks, form collaborative teams, and upload proposals and documentation.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3 feature-card">
                <Card.Body>
                  <div className="bg-success bg-opacity-10 text-success p-3 rounded-3 d-inline-flex mb-3">
                    <UserCheck size={24} />
                  </div>
                  <h5 className="fw-bold mb-2">Faculty Evaluation</h5>
                  <p className="text-muted small mb-0">
                    Predefined criteria rubrics with automated maximum mark validation, draft saving, qualitative remarks, and approval decisions.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3 feature-card">
                <Card.Body>
                  <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-3 d-inline-flex mb-3">
                    <TrendingUp size={24} />
                  </div>
                  <h5 className="fw-bold mb-2">Feedback Tracking</h5>
                  <p className="text-muted small mb-0">
                    Transparent stage-by-stage audit trails. When changes are requested, students update submissions for rapid re-review.
                  </p>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3 feature-card">
                <Card.Body>
                  <div className="bg-info bg-opacity-10 text-info p-3 rounded-3 d-inline-flex mb-3">
                    <Award size={24} />
                  </div>
                  <h5 className="fw-bold mb-2">Analytics & Reports</h5>
                  <p className="text-muted small mb-0">
                    Administrators monitor department progress, review completion percentages, stage distributions, and export data directly to CSV.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* 3-Step Review Workflow Section */}
      <section className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <Container className="py-4">
          <div className="text-center max-w-700 mx-auto mb-5">
            <h6 className="text-primary fw-bold text-uppercase tracking-wider">Academic Rubrics</h6>
            <h2 className="fw-bold text-dark display-6">Structured 3-Stage Evaluation Workflow</h2>
            <p className="text-muted">
              Standardized criteria across all semesters ensure objective scoring, clear faculty accountability, and demonstrable student growth.
            </p>
          </div>

          <Row className="gy-4">
            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-primary px-3 py-1.5 rounded-pill">Stage 1</span>
                    <span className="fw-bold text-primary">100 Marks</span>
                  </div>
                  <h4 className="fw-bold mb-2">Proposal Review</h4>
                  <p className="text-muted small mb-3">Initial problem formulation and research viability assessment.</p>
                  <ul className="list-unstyled small d-flex flex-column gap-2 mb-0 border-top pt-3">
                    <li className="d-flex justify-content-between"><span>Problem Definition</span><span className="fw-semibold">20 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Literature Survey</span><span className="fw-semibold">20 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Proposed Solution</span><span className="fw-semibold">20 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Innovation</span><span className="fw-semibold">20 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Presentation</span><span className="fw-semibold">20 marks</span></li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-info text-white px-3 py-1.5 rounded-pill">Stage 2</span>
                    <span className="fw-bold text-info">100 Marks</span>
                  </div>
                  <h4 className="fw-bold mb-2">Progress Review</h4>
                  <p className="text-muted small mb-3">Mid-term architecture, data modeling, and milestone completion check.</p>
                  <ul className="list-unstyled small d-flex flex-column gap-2 mb-0 border-top pt-3">
                    <li className="d-flex justify-content-between"><span>Implementation Progress</span><span className="fw-semibold">25 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Database Design</span><span className="fw-semibold">15 marks</span></li>
                    <li className="d-flex justify-content-between"><span>User Interface & UX</span><span className="fw-semibold">15 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Functionality</span><span className="fw-semibold">25 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Progress vs Objectives</span><span className="fw-semibold">20 marks</span></li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="badge bg-success px-3 py-1.5 rounded-pill">Stage 3</span>
                    <span className="fw-bold text-success">100 Marks</span>
                  </div>
                  <h4 className="fw-bold mb-2">Final Review</h4>
                  <p className="text-muted small mb-3">Live working demonstration, technical robustness, and documentation.</p>
                  <ul className="list-unstyled small d-flex flex-column gap-2 mb-0 border-top pt-3">
                    <li className="d-flex justify-content-between"><span>Working Demonstration</span><span className="fw-semibold">25 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Technical Implementation</span><span className="fw-semibold">25 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Documentation</span><span className="fw-semibold">15 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Presentation</span><span className="fw-semibold">15 marks</span></li>
                    <li className="d-flex justify-content-between"><span>Innovation</span><span className="fw-semibold">20 marks</span></li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quick Demo Credentials Callout */}
      <section className="py-5 bg-white border-top">
        <Container className="py-2">
          <div className="bg-primary bg-opacity-5 border border-primary border-opacity-25 rounded-4 p-4 p-md-5">
            <Row className="align-items-center gy-4">
              <Col lg={8}>
                <h3 className="fw-bold text-dark mb-2">Ready to test ProjectPulse?</h3>
                <p className="text-muted mb-0">
                  Pre-configured demo accounts are available for Administrator, Faculty Reviewer, and Student roles with sample projects in all evaluation stages.
                </p>
              </Col>
              <Col lg={4} className="text-lg-end">
                <Button as={Link} to="/login" variant="primary" size="lg" className="rounded-pill px-4 shadow-sm">
                  Sign In with Demo Accounts
                </Button>
              </Col>
            </Row>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
