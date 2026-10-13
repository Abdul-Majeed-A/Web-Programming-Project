import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, Mail, BookOpen } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-5 text-secondary">
      <Container>
        <Row className="gy-4">
          <Col lg={4} md={6}>
            <div className="d-flex align-items-center gap-2 mb-3">
              <div className="bg-primary text-white p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <Activity size={18} />
              </div>
              <span className="fs-5 fw-bold text-dark" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Project<span className="text-primary">Pulse</span>
              </span>
            </div>
            <p className="text-muted small pe-lg-4">
              A comprehensive Software Project Review and Evaluation System designed for colleges and universities to streamline student projects, faculty assessments, and multi-stage academic reviews.
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <ShieldCheck size={16} className="text-success" /> Role-Based Access Control • Secure Evaluations
            </div>
          </Col>

          <Col lg={2} sm={6}>
            <h6 className="fw-bold text-dark mb-3">Navigation</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/" className="text-decoration-none text-muted hover-primary">Home</Link></li>
              <li><Link to="/about" className="text-decoration-none text-muted hover-primary">About System</Link></li>
              <li><Link to="/features" className="text-decoration-none text-muted hover-primary">Key Features</Link></li>
              <li><Link to="/login" className="text-decoration-none text-muted hover-primary">Portal Login</Link></li>
            </ul>
          </Col>

          <Col lg={3} sm={6}>
            <h6 className="fw-bold text-dark mb-3">Review Stages</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li className="text-muted">• Review 1: Proposal Review (100 Marks)</li>
              <li className="text-muted">• Review 2: Progress Review (100 Marks)</li>
              <li className="text-muted">• Review 3: Final Review (100 Marks)</li>
              <li className="text-muted">• Weighted Aggregate Scoring</li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h6 className="fw-bold text-dark mb-3">Academic Management</h6>
            <p className="text-muted small mb-2">
              Department of Computer Science & Engineering
            </p>
            <div className="d-flex align-items-center gap-2 text-muted small mb-1">
              <Mail size={14} /> support@projectpulse.edu
            </div>
            <div className="d-flex align-items-center gap-2 text-muted small">
              <BookOpen size={14} /> Academic Year 2026-2027
            </div>
          </Col>
        </Row>

        <div className="border-top mt-4 pt-4 d-flex flex-column flex-sm-row justify-content-between align-items-center text-muted small gap-2">
          <span>&copy; {new Date().getFullYear()} ProjectPulse System. All rights reserved.</span>
          <span>Designed for Colleges & Universities</span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
