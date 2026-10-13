import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { ShieldCheck, Award, Users, BookOpen, Clock, CheckCircle2 } from 'lucide-react';

const About = () => {
  return (
    <div className="py-5" style={{ backgroundColor: '#f8fafc' }}>
      <Container className="py-4">
        {/* Header */}
        <div className="text-center max-w-700 mx-auto mb-5">
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill fw-semibold mb-2">
            Academic Context & Vision
          </span>
          <h1 className="fw-extrabold text-dark display-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            About ProjectPulse
          </h1>
          <p className="lead text-muted">
            The next-generation centralized platform for academic software project governance and objective evaluation.
          </p>
        </div>

        {/* Problem & Solution Grid */}
        <Row className="gy-4 mb-5">
          <Col md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-4 bg-white">
              <h4 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                <Clock size={22} /> The Traditional Problem
              </h4>
              <p className="text-muted">
                Universities and colleges historically coordinate senior capstone and semester software projects through fragmented channels: handwritten evaluation slips, disparate spreadsheets, and unorganized email threads.
              </p>
              <ul className="text-muted small d-flex flex-column gap-2 mb-0 ps-3">
                <li>Students struggle to track feedback, requested changes, and scheduling dates.</li>
                <li>Faculty reviewers encounter inconsistent scoring criteria and double-entry fatigue.</li>
                <li>Heads of Department lack real-time visibility into overall review progress and accreditation metrics.</li>
              </ul>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-4 bg-white border-start border-4 border-primary">
              <h4 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                <ShieldCheck size={22} /> The ProjectPulse Solution
              </h4>
              <p className="text-muted">
                ProjectPulse establishes an integrated digital backbone. Every milestone—from proposal formulation to code defense—is archived, scored according to explicit rubrics, and converted into structured performance analytics.
              </p>
              <ul className="text-muted small d-flex flex-column gap-2 mb-0 ps-3">
                <li>Instant role-based dashboards tailored for Students, Faculty, and Admins.</li>
                <li>Automated score calculations, configurable stage weightages, and PDF document vaults.</li>
                <li>Auditable revision histories with automated in-app notifications.</li>
              </ul>
            </Card>
          </Col>
        </Row>

        {/* Impact Pillars */}
        <div className="text-center max-w-700 mx-auto mb-4 pt-3">
          <h3 className="fw-bold text-dark">Who Benefits from ProjectPulse?</h3>
        </div>

        <Row className="gy-4">
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white text-center">
              <Card.Body>
                <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-flex mb-3">
                  <BookOpen size={28} />
                </div>
                <h5 className="fw-bold mb-2">Student Engineers</h5>
                <p className="text-muted small mb-0">
                  Form teams, upload technical deliverables, track exact review dates, and review detailed breakdown marks and reviewer comments to iterate projects efficiently.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white text-center">
              <Card.Body>
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle d-inline-flex mb-3">
                  <Users size={28} />
                </div>
                <h5 className="fw-bold mb-2">Faculty Reviewers</h5>
                <p className="text-muted small mb-0">
                  Access standardized evaluation sheets, enter criterion marks within validated bounds, save drafts during presentations, and make clear Approved/Changes Required decisions.
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white text-center">
              <Card.Body>
                <div className="bg-info bg-opacity-10 text-info p-3 rounded-circle d-inline-flex mb-3">
                  <Award size={28} />
                </div>
                <h5 className="fw-bold mb-2">Administrators & HODs</h5>
                <p className="text-muted small mb-0">
                  Assign faculty evaluators to projects, schedule venue/link dates, customize rubric weightages, monitor live completion dashboards, and export reports for university accreditation.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;
