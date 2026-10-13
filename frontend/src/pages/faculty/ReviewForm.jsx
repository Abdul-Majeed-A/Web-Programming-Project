import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import ConfirmModal from '../../components/ConfirmModal';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime, formatFileSize } from '../../utils/formatters';
import {
  ArrowLeft,
  CheckCircle,
  Save,
  Send,
  FileText,
  Download,
  AlertCircle,
  HelpCircle,
  Layers,
  Award,
} from 'lucide-react';

const ReviewForm = () => {
  const { id } = useParams(); // Project ID
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [stages, setStages] = useState([]);
  const [selectedStageId, setSelectedStageId] = useState(1);
  const [criteria, setCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [feedback, setFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [decision, setDecision] = useState('Approved');

  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, stagesRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get('/reviews/stages'),
        ]);

        if (projRes.data.success) {
          const p = projRes.data.data;
          setProject(p);
          setSelectedStageId(p.current_stage_id || 1);
        }

        if (stagesRes.data.success) {
          setStages(stagesRes.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project details for evaluation.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // When selected stage changes, fetch criteria for that stage
  useEffect(() => {
    if (!selectedStageId) return;

    const fetchCriteriaAndExistingReview = async () => {
      try {
        const res = await api.get(`/reviews/criteria/${selectedStageId}`);
        if (res.data.success) {
          const critList = res.data.data;
          setCriteria(critList);

          // Check if there is already a review or draft for this project & stage
          const initialScores = {};
          critList.forEach((c) => {
            initialScores[c.id] = { marksAwarded: 0, comments: '' };
          });

          // Check existing review in project.reviews if available
          const existingReview = project?.reviews?.find(
            (r) => r.stage_id === Number(selectedStageId)
          );

          if (existingReview) {
            setFeedback(existingReview.feedback || '');
            setStrengths(existingReview.strengths || '');
            setWeaknesses(existingReview.weaknesses || '');
            if (existingReview.decision) setDecision(existingReview.decision);

            if (existingReview.scores && existingReview.scores.length > 0) {
              existingReview.scores.forEach((sc) => {
                initialScores[sc.criterion_id] = {
                  marksAwarded: Number(sc.marks_awarded) || 0,
                  comments: sc.comments || '',
                };
              });
            }
          }

          setScores(initialScores);
        }
      } catch (err) {
        console.error('Failed to load criteria:', err);
      }
    };

    fetchCriteriaAndExistingReview();
  }, [selectedStageId, project]);

  const handleScoreChange = (criterionId, val) => {
    const num = Math.max(0, parseFloat(val) || 0);
    setScores((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        marksAwarded: num,
      },
    }));
    setError('');
  };

  const handleCommentChange = (criterionId, val) => {
    setScores((prev) => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        comments: val,
      },
    }));
  };

  // Calculate live total marks and percentage
  const totalMaxMarks = criteria.reduce((sum, c) => sum + Number(c.maximum_marks), 0);
  const totalAwarded = Object.values(scores).reduce((sum, s) => sum + (Number(s.marksAwarded) || 0), 0);
  const percentage = totalMaxMarks > 0 ? ((totalAwarded / totalMaxMarks) * 100).toFixed(1) : 0;

  // Prepare payload
  const buildPayload = () => {
    const scoresArray = criteria.map((c) => ({
      criterionId: c.id,
      marksAwarded: scores[c.id]?.marksAwarded || 0,
      comments: scores[c.id]?.comments || '',
    }));

    return {
      projectId: Number(id),
      stageId: Number(selectedStageId),
      scores: scoresArray,
      feedback,
      strengths,
      weaknesses,
      decision,
    };
  };

  // Save Draft
  const handleSaveDraft = async () => {
    setSavingDraft(true);
    setError('');
    setSuccess('');
    try {
      const payload = buildPayload();
      const res = await api.post('/reviews/draft', payload);
      if (res.data.success) {
        setSuccess('Evaluation saved as Draft successfully.');
      } else {
        setError(res.data.message || 'Failed to save draft.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error saving review draft.');
    } finally {
      setSavingDraft(false);
    }
  };

  // Final Submit
  const handleConfirmSubmit = async () => {
    // Validate bounds
    for (const c of criteria) {
      const mark = scores[c.id]?.marksAwarded || 0;
      if (mark > c.maximum_marks) {
        setError(`Marks for "${c.criterion_name}" (${mark}) exceed maximum permitted (${c.maximum_marks}).`);
        setShowConfirmModal(false);
        return;
      }
    }

    if (!feedback || feedback.trim().length < 10) {
      setError('Please provide detailed overall feedback (minimum 10 characters).');
      setShowConfirmModal(false);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = buildPayload();
      const res = await api.post('/reviews/submit', payload);
      if (res.data.success) {
        setSuccess(`Review submitted successfully! Total score: ${res.data.totalMarks}/100. Decision: ${res.data.decision}.`);
        setShowConfirmModal(false);
        setTimeout(() => {
          navigate('/faculty/assigned');
        }, 1500);
      } else {
        setError(res.data.message || 'Failed to submit evaluation.');
        setShowConfirmModal(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error submitting evaluation.');
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Download document
  const handleDownload = async (docId, originalFilename) => {
    try {
      const response = await api.get(`/projects/${id}/documents/${docId}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Unable to download file.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading evaluation form and project deliverables..." />;
  if (error && !project) return <Alert variant="danger" className="m-4">{error}</Alert>;
  if (!project) return null;

  return (
    <div>
      {/* Top Bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/faculty/assigned" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2 hover-primary">
            <ArrowLeft size={14} /> Back to Assigned Projects
          </Link>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <h3 className="fw-extrabold text-dark mb-0" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Project Review Form: {project.title}
            </h3>
            <StatusBadge status={project.status} />
          </div>
          <div className="text-muted small mt-1">
            Student Team Lead: <strong>{project.creator_name}</strong> • Department: {project.creator_department}
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button variant="outline-secondary" className="rounded-pill px-3 d-flex align-items-center gap-1.5" onClick={handleSaveDraft} disabled={savingDraft || submitting}>
            <Save size={16} /> {savingDraft ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button variant="primary" className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2" onClick={() => setShowConfirmModal(true)} disabled={submitting}>
            <Send size={16} /> Submit Evaluation
          </Button>
        </div>
      </div>

      {success && (
        <Alert variant="success" className="rounded-3 mb-4">
          <CheckCircle size={18} className="me-2 d-inline" /> {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="rounded-3 mb-4">
          <AlertCircle size={18} className="me-2 d-inline" /> {error}
        </Alert>
      )}

      <Row className="gy-4">
        {/* Left Column: Project Deliverables and Context */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3">
            <Card.Header className="bg-transparent border-0 pt-2 px-2 pb-0">
              <h5 className="fw-bold text-dark mb-0 fs-6">Submission Deliverables</h5>
            </Card.Header>
            <Card.Body className="p-2 pt-3">
              {project.documents?.length === 0 ? (
                <p className="text-muted small mb-0">No documents uploaded yet by the student team.</p>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {project.documents.map((doc) => (
                    <div key={doc.id} className="p-2.5 rounded-3 border bg-light d-flex justify-content-between align-items-center">
                      <div className="overflow-hidden pe-2">
                        <div className="fw-semibold text-dark small text-truncate">{doc.original_filename}</div>
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {doc.document_type} • {formatFileSize(doc.file_size)}
                        </div>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="rounded-pill p-1.5 flex-shrink-0"
                        onClick={() => handleDownload(doc.id, doc.original_filename)}
                        title="Download file"
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Project Objectives */}
          <Card className="border-0 shadow-sm rounded-4 bg-white p-3 mb-4">
            <Card.Header className="bg-transparent border-0 pt-2 px-2 pb-0">
              <h5 className="fw-bold text-dark mb-0 fs-6">Project Objectives</h5>
            </Card.Header>
            <Card.Body className="p-2 pt-3">
              <div className="bg-light p-3 rounded-3 border small text-secondary">
                <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                  {project.objectives}
                </pre>
              </div>
            </Card.Body>
          </Card>

          {/* Live Score Counter */}
          <Card className="border-0 shadow-sm rounded-4 bg-primary text-white p-4">
            <Card.Body className="p-0 text-center">
              <span className="text-white-50 text-uppercase small fw-bold tracking-wider">Evaluation Live Total</span>
              <h1 className="display-4 fw-extrabold mt-1 mb-1">
                {totalAwarded} <span className="fs-4 text-white-50">/ {totalMaxMarks}</span>
              </h1>
              <p className="mb-3 text-white-50 small">Percentage: {percentage}%</p>
              <ProgressBar now={percentage} variant="light" style={{ height: '8px' }} />
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Review Form Rubric */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 bg-white p-4">
            <Card.Body className="p-0">
              {/* Stage Selection */}
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 pb-3 border-bottom gap-2">
                <div>
                  <h5 className="fw-bold text-dark mb-0">Evaluation Rubric</h5>
                  <span className="text-muted small">Select review stage to score predefined criteria</span>
                </div>
                <Form.Select
                  value={selectedStageId}
                  onChange={(e) => setSelectedStageId(Number(e.target.value))}
                  style={{ width: '260px' }}
                  className="rounded-3 fw-semibold"
                >
                  {stages.map((stg) => (
                    <option key={stg.id} value={stg.id}>
                      {stg.stage_name} (100 Marks)
                    </option>
                  ))}
                </Form.Select>
              </div>

              {/* Criteria Score Inputs */}
              <div className="mb-4">
                <h6 className="fw-bold text-dark mb-3 small text-uppercase tracking-wider">
                  Criterion Scoring (Validated Maximums)
                </h6>
                <Table responsive bordered className="align-middle">
                  <thead className="table-light small">
                    <tr>
                      <th>Criterion</th>
                      <th style={{ width: '130px' }} className="text-center">Max Marks</th>
                      <th style={{ width: '140px' }}>Marks Awarded</th>
                      <th>Criterion Comment</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {criteria.map((c) => {
                      const currentAwarded = scores[c.id]?.marksAwarded ?? 0;
                      const isOverLimit = currentAwarded > c.maximum_marks;
                      return (
                        <tr key={c.id}>
                          <td>
                            <div className="fw-semibold text-dark">{c.criterion_name}</div>
                          </td>
                          <td className="text-center fw-bold text-muted">
                            {c.maximum_marks}
                          </td>
                          <td>
                            <Form.Control
                              type="number"
                              min="0"
                              max={c.maximum_marks}
                              step="0.5"
                              value={scores[c.id]?.marksAwarded ?? ''}
                              onChange={(e) => handleScoreChange(c.id, e.target.value)}
                              className={`py-1 ${isOverLimit ? 'is-invalid' : ''}`}
                            />
                            {isOverLimit && (
                              <div className="invalid-feedback" style={{ fontSize: '0.7rem' }}>
                                Max {c.maximum_marks} marks
                              </div>
                            )}
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              placeholder="Optional remarks..."
                              value={scores[c.id]?.comments || ''}
                              onChange={(e) => handleCommentChange(c.id, e.target.value)}
                              className="py-1"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Qualitative remarks & Decision */}
              <div className="mb-4">
                <h6 className="fw-bold text-dark mb-3 small text-uppercase tracking-wider">
                  Qualitative Assessment & Recommendations
                </h6>
                <Row className="gy-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted">Project Strengths</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={strengths}
                        onChange={(e) => setStrengths(e.target.value)}
                        placeholder="Key technical achievements, good design, clean code..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted">Areas for Improvement / Weaknesses</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={weaknesses}
                        onChange={(e) => setWeaknesses(e.target.value)}
                        placeholder="Identified gaps, missing test cases, optimization needs..."
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted">Overall Review Feedback & Requested Revisions *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Comprehensive feedback explaining the score and actionable suggestions for the next review stage..."
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted">Review Decision *</Form.Label>
                      <Form.Select
                        value={decision}
                        onChange={(e) => setDecision(e.target.value)}
                        className="py-2 fw-semibold"
                      >
                        <option value="Approved">Approved (Advance to Next Stage)</option>
                        <option value="Changes Required">Changes Required (Requires Student Resubmission)</option>
                        <option value="Rejected">Rejected (Substandard Deliverable)</option>
                      </Form.Select>
                      <Form.Text className="text-muted small">
                        "Changes Required" notifies the team to make revisions and resubmit.
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              {/* Action Buttons in Footer */}
              <div className="d-flex justify-content-end gap-3 pt-3 border-top">
                <Button variant="light" className="rounded-pill px-4" onClick={handleSaveDraft} disabled={savingDraft || submitting}>
                  <Save size={16} className="me-1 d-inline" /> Save Draft
                </Button>
                <Button variant="primary" className="rounded-pill px-4 shadow-sm" onClick={() => setShowConfirmModal(true)} disabled={submitting}>
                  <Send size={16} className="me-1 d-inline" /> Submit Final Evaluation
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirmation Dialog */}
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        title="Submit Review Evaluation"
        message={`Are you sure you want to submit your final evaluation for "${project.title}"? Total marks: ${totalAwarded} / 100 (${percentage}%). Decision: "${decision}". This will update the project's official records and notify the student team.`}
        confirmText="Confirm & Submit"
        confirmVariant={decision === 'Approved' ? 'success' : decision === 'Changes Required' ? 'warning' : 'danger'}
        loading={submitting}
      />
    </div>
  );
};

export default ReviewForm;
