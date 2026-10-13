import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import {
  ShieldCheck,
  Layers,
  UploadCloud,
  Bell,
  BarChart,
  FileSpreadsheet,
  CheckCircle2,
  Users2,
  FileCheck,
} from 'lucide-react';

const Features = () => {
  const featureList = [
    {
      icon: ShieldCheck,
      color: 'primary',
      title: 'Role-Based Access Control',
      description: 'Strict, isolated portals for Students, Faculty Reviewers, and Administrators. Zero unauthorized marks manipulation or cross-student grade leakage.',
    },
    {
      icon: Layers,
      color: 'info',
      title: 'Standardized 3-Stage Rubrics',
      description: 'Proposal Review, Progress Review, and Final Working Defense rubrics with criteria marks validation (100 marks total per review).',
    },
    {
      icon: UploadCloud,
      color: 'success',
      title: 'Controlled Document Vault',
      description: 'Controlled file uploads for PDF proposals, technical progress reports, and slide decks. Safe server-side filenames with authenticated downloads.',
    },
    {
      icon: Bell,
      color: 'warning',
      title: 'In-App Notification Engine',
      description: 'Instant notification triggers for reviewer assignment, review scheduling, evaluation completion, changes requested, and status transitions.',
    },
    {
      icon: BarChart,
      color: 'purple',
      title: 'Live Analytical Dashboards',
      description: 'Dynamic database aggregations displaying stage distributions, approval ratios, and department performance charts without static mocks.',
    },
    {
      icon: FileSpreadsheet,
      color: 'danger',
      title: 'One-Click CSV Export',
      description: 'Comprehensive reporting with dynamic filters for Department, Status, Reviewer, and Date range. Export clean CSV records for institutional reporting.',
    },
    {
      icon: Users2,
      color: 'primary',
      title: 'Collaborative Team Management',
      description: 'Students form collaborative project teams using verified student identifiers. Roles such as Team Lead, Frontend, and Backend are tracked.',
    },
    {
      icon: FileCheck,
      color: 'success',
      title: 'Iterative Revision Workflow',
      description: 'When reviewers request modifications, projects transition to Changes Required, enabling students to update submissions and resubmit for evaluation.',
    },
  ];

  return (
    <div className="py-5" style={{ backgroundColor: '#f8fafc' }}>
      <Container className="py-4">
        <div className="text-center max-w-700 mx-auto mb-5">
          <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-1.5 rounded-pill fw-semibold mb-2">
            System Architecture
          </span>
          <h1 className="fw-extrabold text-dark display-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            System Features & Architecture
          </h1>
          <p className="lead text-muted">
            Engineered with modern full-stack web standards to handle university project evaluation at institutional scale.
          </p>
        </div>

        <Row className="gy-4">
          {featureList.map((f, idx) => {
            const Icon = f.icon;
            return (
              <Col md={6} lg={4} key={idx}>
                <Card className="border-0 shadow-sm rounded-4 h-100 p-3 bg-white feature-card">
                  <Card.Body>
                    <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-3 d-inline-flex mb-3">
                      <Icon size={24} />
                    </div>
                    <h5 className="fw-bold mb-2 text-dark">{f.title}</h5>
                    <p className="text-muted small mb-0">{f.description}</p>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </div>
  );
};

export default Features;
