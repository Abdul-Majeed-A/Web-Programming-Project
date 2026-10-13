import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, InputGroup, Badge, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatters';
import { FileCheck2, Search, ArrowRight } from 'lucide-react';

const EvaluationRecords = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStage, setSelectedStage] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('');

  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStage) params.stageId = selectedStage;
      if (selectedDecision) params.decision = selectedDecision;

      const [evalRes, stagesRes] = await Promise.all([
        api.get('/reports/evaluations', { params }),
        api.get('/reviews/stages'),
      ]);

      if (evalRes.data.success) setEvaluations(evalRes.data.data);
      if (stagesRes.data.success) setStages(stagesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, [selectedStage, selectedDecision]);

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          All Evaluation Records
        </h3>
        <p className="text-muted small mb-0">Auditable institutional archive of all marks, feedback, and decisions recorded across reviews.</p>
      </div>

      {/* Filter Box */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3">
        <Card.Body className="p-2">
          <Row className="gy-3">
            <Col sm={6} md={4}>
              <Form.Select value={selectedStage} onChange={(e) => setSelectedStage(e.target.value)}>
                <option value="">All Review Stages</option>
                {stages.map((stg) => (
                  <option key={stg.id} value={stg.id}>{stg.stage_name}</option>
                ))}
              </Form.Select>
            </Col>

            <Col sm={6} md={4}>
              <Form.Select value={selectedDecision} onChange={(e) => setSelectedDecision(e.target.value)}>
                <option value="">All Decisions</option>
                <option value="Approved">Approved</option>
                <option value="Changes Required">Changes Required</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner text="Loading evaluation history..." />
          ) : evaluations.length === 0 ? (
            <div className="text-center py-5">
              <FileCheck2 size={36} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark">No evaluations match query</h6>
              <p className="text-muted small mb-0">Try clearing filters.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th className="ps-4">Project Title</th>
                  <th>Stage</th>
                  <th>Student Lead</th>
                  <th>Faculty Reviewer</th>
                  <th>Marks (100)</th>
                  <th>Percentage</th>
                  <th>Decision</th>
                  <th>Submitted Date</th>
                  <th className="pe-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {evaluations.map((ev) => (
                  <tr key={ev.review_id}>
                    <td className="ps-4 fw-bold text-dark">{ev.project_title}</td>
                    <td>
                      <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
                        {ev.stage_name}
                      </Badge>
                    </td>
                    <td>{ev.lead_student_name} ({ev.student_department})</td>
                    <td className="fw-semibold text-secondary">{ev.reviewer_name}</td>
                    <td className="fw-bold text-dark">{ev.total_marks}</td>
                    <td>{ev.percentage}%</td>
                    <td><StatusBadge status={ev.decision} /></td>
                    <td>{formatDateTime(ev.submitted_at)}</td>
                    <td className="pe-4 text-end">
                      <Link to={`/admin/projects/${ev.project_id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                        Project View
                      </Link>
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

export default EvaluationRecords;
