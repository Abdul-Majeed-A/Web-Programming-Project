import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Button, Tabs, Tab, Table, Modal, Form, Alert, ProgressBar } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { formatDate, formatDateTime, formatFileSize } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  Send,
  Edit,
  UserPlus,
  Trash2,
  UploadCloud,
  Download,
  Calendar,
  Layers,
  Code2,
  Target,
  FileText,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Video,
  Clock,
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberInput, setMemberInput] = useState({ identifier_or_email: '', team_role: 'Developer' });
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  const [showDocModal, setShowDocModal] = useState(false);
  const [docFile, setDocFile] = useState(null);
  const [docType, setDocType] = useState('Proposal');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [docError, setDocError] = useState('');

  const fetchProjectDetails = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const isCreator = project?.created_by === user?.id;
  const canEdit = isCreator && ['Draft', 'Changes Required'].includes(project?.status);
  const canSubmit = isCreator && ['Draft', 'Changes Required'].includes(project?.status);

  // Submit project action
  const handleConfirmSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await api.post(`/projects/${id}/submit`);
      if (res.data.success) {
        setActionSuccess(`Project successfully ${res.data.status.toLowerCase()} for faculty review!`);
        setShowSubmitModal(false);
        fetchProjectDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit project.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberInput.identifier_or_email) return;

    setAddingMember(true);
    setMemberError('');
    try {
      const res = await api.post(`/projects/${id}/members`, memberInput);
      if (res.data.success) {
        setShowMemberModal(false);
        setMemberInput({ identifier_or_email: '', team_role: 'Developer' });
        fetchProjectDetails();
      }
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setAddingMember(false);
    }
  };

  // Remove Member
  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${memberId}`);
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member.');
    }
  };

  // Upload Document
  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) {
      setDocError('Please select a document file to upload.');
      return;
    }

    setUploadingDoc(true);
    setDocError('');
    try {
      const formData = new FormData();
      formData.append('document', docFile);
      formData.append('document_type', docType);

      const res = await api.post(`/projects/${id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setShowDocModal(false);
        setDocFile(null);
        fetchProjectDetails();
      }
    } catch (err) {
      setDocError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
    }
  };

  // Download Document
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
      alert('Unable to download file. You may not have authorization.');
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await api.delete(`/projects/${id}/documents/${docId}`);
      fetchProjectDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading comprehensive project data..." />;
  if (error && !project) return <Alert variant="danger" className="rounded-3 m-4">{error}</Alert>;
  if (!project) return null;

  return (
    <div>
      {/* Top Breadcrumb & Action bar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <Link to="/student/projects" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2 hover-primary">
            <ArrowLeft size={14} /> Back to Projects
          </Link>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <h3 className="fw-extrabold text-dark mb-0" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {project.title}
            </h3>
            <StatusBadge status={project.status} />
          </div>
          <div className="text-muted small mt-1 d-flex flex-wrap align-items-center gap-3">
            <span><strong>Category:</strong> {project.category}</span>
            <span>•</span>
            <span><strong>Lead:</strong> {project.creator_name} ({project.creator_department})</span>
            <span>•</span>
            <span><strong>Created:</strong> {formatDate(project.created_at)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap gap-2">
          {canEdit && (
            <Button as={Link} to={`/student/projects/${id}/edit`} variant="outline-primary" className="rounded-pill px-3 d-flex align-items-center gap-1.5">
              <Edit size={16} /> Edit Details
            </Button>
          )}

          {canSubmit && (
            <Button
              variant="primary"
              className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
              onClick={() => setShowSubmitModal(true)}
            >
              <Send size={16} /> {project.status === 'Changes Required' ? 'Resubmit Project' : 'Submit for Review'}
            </Button>
          )}
        </div>
      </div>

      {actionSuccess && (
        <Alert variant="success" dismissible onClose={() => setActionSuccess('')} className="rounded-3 mb-4">
          <CheckCircle size={18} className="me-2 d-inline" /> {actionSuccess}
        </Alert>
      )}

      {/* Review Stage Stepper Pipeline */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 bg-white p-3">
        <Card.Body className="p-2">
          <h6 className="fw-bold text-dark mb-3 small text-uppercase tracking-wider">
            Academic Review Stages Pipeline
          </h6>
          <Row className="gy-3 text-center">
            {[
              { num: 1, name: 'Review 1: Proposal', desc: 'Problem, Literature, Solution' },
              { num: 2, name: 'Review 2: Progress', desc: 'Implementation, DB, UI/UX' },
              { num: 3, name: 'Review 3: Final Defense', desc: 'Working Demo, Documentation' },
            ].map((stg) => {
              const isPast = project.current_stage_id > stg.num || project.status === 'Approved';
              const isCurrent = project.current_stage_id === stg.num && project.status !== 'Approved';
              const stageReviews = project.reviews?.filter((r) => r.stage_id === stg.num && r.review_status === 'Submitted') || [];
              const latestReview = stageReviews[0];

              return (
                <Col md={4} key={stg.num}>
                  <div
                    className={`p-3 rounded-3 h-100 border text-start transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary bg-opacity-5'
                        : isPast
                        ? 'border-success bg-success bg-opacity-5'
                        : 'border-light bg-light'
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className={`badge rounded-pill px-2.5 py-1 ${isPast ? 'bg-success' : isCurrent ? 'bg-primary' : 'bg-secondary'}`}>
                        Stage {stg.num}
                      </span>
                      {latestReview ? (
                        <StatusBadge status={latestReview.decision} />
                      ) : (
                        <span className="text-muted small">{isPast ? 'Passed' : isCurrent ? 'In Progress' : 'Pending'}</span>
                      )}
                    </div>
                    <h6 className="fw-bold text-dark mb-1">{stg.name}</h6>
                    <p className="text-muted small mb-2" style={{ fontSize: '0.78rem' }}>{stg.desc}</p>
                    {latestReview && (
                      <div className="fw-bold text-dark small border-top pt-2 mt-1">
                        Score: {latestReview.total_marks} / 100 ({latestReview.percentage}%)
                      </div>
                    )}
                  </div>
                </Col>
              );
            })}
          </Row>
        </Card.Body>
      </Card>

      {/* Main Tabs Container */}
      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden mb-4">
        <Tabs defaultActiveKey="overview" className="border-bottom px-4 pt-3 bg-light" id="project-tabs">
          {/* TAB 1: OVERVIEW */}
          <Tab eventKey="overview" title="Project Overview" className="p-4">
            <Row className="gy-4">
              <Col lg={8}>
                <div className="mb-4">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                    <FileText size={18} className="text-primary" /> Description
                  </h6>
                  <p className="text-secondary leading-relaxed bg-light p-3 rounded-3 border">
                    {project.description}
                  </p>
                </div>

                <div className="mb-4">
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                    <Target size={18} className="text-primary" /> Project Objectives
                  </h6>
                  <div className="bg-light p-3 rounded-3 border">
                    <pre className="mb-0 text-secondary" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                      {project.objectives}
                    </pre>
                  </div>
                </div>

                <div>
                  <h6 className="fw-bold text-dark d-flex align-items-center gap-2 mb-2">
                    <Code2 size={18} className="text-primary" /> Technology Stack
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {project.technology_stack?.split(',').map((tech, i) => (
                      <Badge key={i} bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 fw-medium rounded-pill">
                        {tech.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Col>

              <Col lg={4}>
                <Card className="border rounded-3 p-3 bg-light mb-3">
                  <h6 className="fw-bold text-dark mb-3">Review Information</h6>
                  <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
                    <li className="d-flex justify-content-between">
                      <span className="text-muted">Current Review:</span>
                      <span className="fw-semibold text-primary">{project.stage_name}</span>
                    </li>
                    <li className="d-flex justify-content-between">
                      <span className="text-muted">Weightage:</span>
                      <span className="fw-semibold">{project.current_stage_weightage || '33.33'}%</span>
                    </li>
                    <li className="d-flex justify-content-between">
                      <span className="text-muted">Lifecycle Status:</span>
                      <StatusBadge status={project.status} />
                    </li>
                    {project.final_score !== null && (
                      <li className="d-flex justify-content-between pt-2 border-top">
                        <span className="fw-bold text-success">Overall Aggregate:</span>
                        <span className="fw-extrabold text-success fs-5">{project.final_score}%</span>
                      </li>
                    )}
                  </ul>
                </Card>

                {/* Assigned Faculty */}
                <Card className="border rounded-3 p-3 bg-light">
                  <h6 className="fw-bold text-dark mb-2">Assigned Faculty Reviewers</h6>
                  {project.assignments?.length === 0 ? (
                    <p className="text-muted small mb-0">No faculty reviewers assigned yet by admin.</p>
                  ) : (
                    <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
                      {project.assignments.map((a) => (
                        <li key={a.assignment_id} className="d-flex align-items-center gap-2">
                          <div className="bg-primary text-white rounded-circle p-1 small fw-bold" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {a.full_name?.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark">{a.full_name}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{a.department}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* TAB 2: TEAM MEMBERS */}
          <Tab eventKey="members" title={`Team Members (${project.members?.length || 1})`} className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">Project Collaborative Team</h5>
                <span className="text-muted small">Registered students collaborating on this software deliverable</span>
              </div>
              {canEdit && (
                <Button variant="primary" size="sm" className="rounded-pill px-3 d-flex align-items-center gap-1.5" onClick={() => setShowMemberModal(true)}>
                  <UserPlus size={16} /> Add Team Member
                </Button>
              )}
            </div>

            <Table responsive hover className="align-middle border rounded-3 overflow-hidden">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th>Student Name</th>
                  <th>Roll / Identifier</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Added At</th>
                  {canEdit && <th>Action</th>}
                </tr>
              </thead>
              <tbody className="small">
                {project.members?.map((m) => (
                  <tr key={m.member_id}>
                    <td>
                      <div className="fw-semibold text-dark">{m.full_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{m.email}</div>
                    </td>
                    <td>{m.student_or_faculty_identifier || 'N/A'}</td>
                    <td>{m.department}</td>
                    <td>
                      <Badge bg={m.team_role === 'Team Lead' ? 'primary' : 'light'} text={m.team_role === 'Team Lead' ? 'white' : 'dark'} className="border px-2.5 py-1">
                        {m.team_role}
                      </Badge>
                    </td>
                    <td>{formatDate(m.added_at)}</td>
                    {canEdit && (
                      <td>
                        {m.user_id !== project.created_by ? (
                          <Button variant="outline-danger" size="sm" className="p-1 rounded-2" onClick={() => handleRemoveMember(m.member_id)}>
                            <Trash2 size={15} />
                          </Button>
                        ) : (
                          <span className="text-muted small">Creator</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          {/* TAB 3: DOCUMENTS */}
          <Tab eventKey="documents" title={`Documents (${project.documents?.length || 0})`} className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">Project Deliverables & Reports</h5>
                <span className="text-muted small">Upload proposals, progress reports, presentation slide decks (PDF, PPTX, DOCX, ZIP)</span>
              </div>
              <Button variant="primary" size="sm" className="rounded-pill px-3 d-flex align-items-center gap-1.5" onClick={() => setShowDocModal(true)}>
                <UploadCloud size={16} /> Upload Document
              </Button>
            </div>

            {project.documents?.length === 0 ? (
              <div className="text-center py-5 border rounded-3 bg-light">
                <FileText size={36} className="text-muted mb-2" />
                <h6 className="fw-bold text-dark">No documents uploaded</h6>
                <p className="text-muted small mb-3">Upload your proposal report and presentation before review.</p>
                <Button variant="primary" size="sm" className="rounded-pill px-3" onClick={() => setShowDocModal(true)}>
                  Upload Deliverable
                </Button>
              </div>
            ) : (
              <Table responsive hover className="align-middle border rounded-3 overflow-hidden">
                <thead className="table-light small text-uppercase text-muted">
                  <tr>
                    <th>Filename</th>
                    <th>Document Type</th>
                    <th>Size</th>
                    <th>Uploaded By</th>
                    <th>Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {project.documents.map((doc) => (
                    <tr key={doc.id}>
                      <td className="fw-semibold text-dark">
                        <FileText size={16} className="me-2 text-primary" />
                        {doc.original_filename}
                      </td>
                      <td>
                        <Badge bg="light" text="dark" className="border px-2.5 py-1">
                          {doc.document_type}
                        </Badge>
                      </td>
                      <td>{formatFileSize(doc.file_size)}</td>
                      <td>{doc.uploader_name}</td>
                      <td>{formatDateTime(doc.uploaded_at)}</td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="rounded-pill px-2.5 py-1 d-flex align-items-center gap-1"
                            onClick={() => handleDownload(doc.id, doc.original_filename)}
                          >
                            <Download size={14} /> Download
                          </Button>
                          {(isCreator || user?.role === 'admin') && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="rounded-pill p-1"
                              onClick={() => handleDeleteDoc(doc.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>

          {/* TAB 4: EVALUATIONS & FEEDBACK */}
          <Tab eventKey="evaluations" title={`Review Evaluations (${project.reviews?.length || 0})`} className="p-4">
            <h5 className="fw-bold text-dark mb-1">Faculty Evaluation Records</h5>
            <p className="text-muted small mb-4">Complete breakdown of criteria marks, percentage calculations, and reviewer comments.</p>

            {project.reviews?.length === 0 ? (
              <div className="text-center py-5 border rounded-3 bg-light">
                <Award size={36} className="text-muted mb-2" />
                <h6 className="fw-bold text-dark">No reviews recorded yet</h6>
                <p className="text-muted small mb-0">Once faculty submits an assessment, detailed criterion scores will appear here.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-4">
                {project.reviews.map((rev) => (
                  <Card key={rev.id} className="border rounded-4 bg-white shadow-xs overflow-hidden">
                    <Card.Header className="bg-light py-3 px-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                      <div>
                        <span className="badge bg-primary me-2">{rev.stage_name}</span>
                        <strong className="text-dark">Evaluated by:</strong> {rev.reviewer_name}
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <StatusBadge status={rev.decision} />
                        <span className="fs-5 fw-bold text-primary">
                          {rev.total_marks} / 100 <small className="text-muted fs-6">({rev.percentage}%)</small>
                        </span>
                      </div>
                    </Card.Header>
                    <Card.Body className="p-4">
                      {/* Criteria Score Table */}
                      <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">Criteria Scoring Rubric</h6>
                      <Table responsive bordered hover className="align-middle mb-4">
                        <thead className="table-light small">
                          <tr>
                            <th>Evaluation Criterion</th>
                            <th style={{ width: '140px' }}>Maximum Marks</th>
                            <th style={{ width: '140px' }}>Marks Awarded</th>
                            <th>Reviewer Remark</th>
                          </tr>
                        </thead>
                        <tbody className="small">
                          {rev.scores?.map((sc) => (
                            <tr key={sc.id}>
                              <td className="fw-medium text-dark">{sc.criterion_name}</td>
                              <td>{sc.maximum_marks}</td>
                              <td className="fw-bold text-primary">{sc.marks_awarded}</td>
                              <td className="text-muted">{sc.comments || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>

                      {/* Qualitative Comments */}
                      <Row className="g-3">
                        {rev.strengths && (
                          <Col md={6}>
                            <div className="p-3 rounded-3 bg-success bg-opacity-5 border border-success border-opacity-25 h-100">
                              <h6 className="fw-bold text-success mb-1 small text-uppercase">Demonstrated Strengths</h6>
                              <p className="mb-0 text-secondary small">{rev.strengths}</p>
                            </div>
                          </Col>
                        )}
                        {rev.weaknesses && (
                          <Col md={6}>
                            <div className="p-3 rounded-3 bg-warning bg-opacity-5 border border-warning border-opacity-25 h-100">
                              <h6 className="fw-bold text-warning mb-1 small text-uppercase">Areas for Improvement / Weaknesses</h6>
                              <p className="mb-0 text-secondary small">{rev.weaknesses}</p>
                            </div>
                          </Col>
                        )}
                        {rev.feedback && (
                          <Col md={12}>
                            <div className="p-3 rounded-3 bg-light border">
                              <h6 className="fw-bold text-dark mb-1 small text-uppercase">Overall Reviewer Feedback</h6>
                              <p className="mb-0 text-secondary small">{rev.feedback}</p>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </Tab>

          {/* TAB 5: SCHEDULES */}
          <Tab eventKey="schedules" title={`Schedules (${project.schedules?.length || 0})`} className="p-4">
            <h5 className="fw-bold text-dark mb-1">Scheduled Review Sessions</h5>
            <p className="text-muted small mb-4">Dates, locations, and meeting links configured by the administrator.</p>

            {project.schedules?.length === 0 ? (
              <div className="text-center py-4 border rounded-3 bg-light text-muted small">
                No review presentations scheduled yet.
              </div>
            ) : (
              <Table responsive hover className="align-middle border rounded-3 overflow-hidden">
                <thead className="table-light small text-uppercase text-muted">
                  <tr>
                    <th>Review Stage</th>
                    <th>Date & Time</th>
                    <th>Location / Online Link</th>
                    <th>Notes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {project.schedules.map((s) => (
                    <tr key={s.id}>
                      <td className="fw-semibold text-dark">{s.stage_name}</td>
                      <td>{formatDateTime(s.scheduled_at)}</td>
                      <td>
                        {s.location_or_meeting_link ? (
                          <div className="d-flex align-items-center gap-1.5 text-primary">
                            <Video size={14} /> {s.location_or_meeting_link}
                          </div>
                        ) : (
                          'TBD'
                        )}
                      </td>
                      <td className="text-muted">{s.notes || '—'}</td>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>
        </Tabs>
      </Card>

      {/* Confirmation Modal for Project Submission */}
      <ConfirmModal
        show={showSubmitModal}
        onHide={() => setShowSubmitModal(false)}
        onConfirm={handleConfirmSubmit}
        title={project.status === 'Changes Required' ? 'Confirm Resubmission' : 'Submit Project for Review'}
        message={`Are you sure you want to ${
          project.status === 'Changes Required' ? 'resubmit' : 'submit'
        } "${project.title}" for review? Once submitted, the status will advance to Under Review and faculty reviewers will be notified.`}
        confirmText={project.status === 'Changes Required' ? 'Confirm Resubmit' : 'Submit Now'}
        confirmVariant="primary"
        loading={submitting}
      />

      {/* Add Team Member Modal */}
      <Modal show={showMemberModal} onHide={() => setShowMemberModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Add Team Member</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddMember}>
          <Modal.Body>
            {memberError && <Alert variant="danger" className="small py-2">{memberError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Student Email or Roll Number *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. student2@projectpulse.edu or STU-2023-CS-089"
                value={memberInput.identifier_or_email}
                onChange={(e) => setMemberInput({ ...memberInput, identifier_or_email: e.target.value })}
                required
              />
              <Form.Text className="text-muted small">Must correspond to a registered student account.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-muted">Team Role</Form.Label>
              <Form.Select
                value={memberInput.team_role}
                onChange={(e) => setMemberInput({ ...memberInput, team_role: e.target.value })}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="ML Engineer">ML Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="QA & Documentation Lead">QA & Documentation Lead</option>
                <option value="Researcher">Researcher</option>
                <option value="Member">Member</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowMemberModal(false)} className="rounded-pill">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={addingMember} className="rounded-pill">
              {addingMember ? 'Adding...' : 'Add Member'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal show={showDocModal} onHide={() => setShowDocModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-5 fw-bold">Upload Project Deliverable</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUploadDocument}>
          <Modal.Body>
            {docError && <Alert variant="danger" className="small py-2">{docError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-muted">Document Classification *</Form.Label>
              <Form.Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                <option value="Proposal">Project Proposal (Stage 1)</option>
                <option value="Progress Report">Mid-Term Progress Report (Stage 2)</option>
                <option value="Final Report">Final Documentation Report (Stage 3)</option>
                <option value="Presentation">Presentation Slide Deck (PPTX / PDF)</option>
                <option value="Code Archive">Code Archive (.zip)</option>
                <option value="Other">Other Document</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-muted">Select File *</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) => setDocFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.txt"
                required
              />
              <Form.Text className="text-muted small">Permitted formats: PDF, DOC, DOCX, PPT, PPTX, ZIP (Max 15MB)</Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="light" onClick={() => setShowDocModal(false)} className="rounded-pill">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={uploadingDoc} className="rounded-pill">
              {uploadingDoc ? 'Uploading...' : 'Upload File'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
