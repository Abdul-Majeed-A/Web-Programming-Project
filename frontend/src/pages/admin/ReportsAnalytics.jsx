import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Tabs, Tab, Row, Col, Badge, Alert } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/formatters';
import { Download, Filter, BarChart3, FileSpreadsheet } from 'lucide-react';

const ReportsAnalytics = () => {
  // Tab 1: Project Reports state
  const [projectReports, setProjectReports] = useState([]);
  const [pLoading, setPLoading] = useState(true);
  const [pFilters, setPFilters] = useState({ department: '', status: '', category: '', fromDate: '', toDate: '' });

  // Tab 2: Evaluation Reports state
  const [evalReports, setEvalReports] = useState([]);
  const [eLoading, setELoading] = useState(true);
  const [eFilters, setEFilters] = useState({ stageId: '', decision: '', fromDate: '', toDate: '' });

  const [stages, setStages] = useState([]);

  const departments = [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence & Data Science',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
  ];

  // Fetch projects report
  const fetchProjectReports = async () => {
    setPLoading(true);
    try {
      const res = await api.get('/reports/projects', { params: pFilters });
      if (res.data.success) {
        setProjectReports(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load project reports:', err);
    } finally {
      setPLoading(false);
    }
  };

  // Fetch evaluation report
  const fetchEvalReports = async () => {
    setELoading(true);
    try {
      const res = await api.get('/reports/evaluations', { params: eFilters });
      if (res.data.success) {
        setEvalReports(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load evaluation reports:', err);
    } finally {
      setELoading(false);
    }
  };

  useEffect(() => {
    fetchProjectReports();
    api.get('/reviews/stages').then((res) => {
      if (res.data.success) setStages(res.data.data);
    });
  }, []);

  const handleExportProjectsCSV = async () => {
    try {
      const res = await api.get('/reports/projects/export', {
        params: pFilters,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ProjectPulse_Projects_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export projects report to CSV.');
    }
  };

  const handleExportEvaluationsCSV = async () => {
    try {
      const res = await api.get('/reports/evaluations/export', {
        params: eFilters,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ProjectPulse_Evaluations_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export evaluations report to CSV.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Reports & Institutional Analytics
        </h3>
        <p className="text-muted small mb-0">Generate filterable academic summaries and export validated CSV spreadsheets for accreditation audits.</p>
      </div>

      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Tabs defaultActiveKey="projects" className="border-bottom px-4 pt-3 bg-light" id="report-tabs">
          {/* TAB 1: PROJECTS REPORT */}
          <Tab eventKey="projects" title="Software Projects Report" className="p-4">
            <Card className="border bg-light rounded-3 p-3 mb-4">
              <Row className="gy-3 align-items-end">
                <Col md={3}>
                  <Form.Label className="small fw-semibold text-muted">Department</Form.Label>
                  <Form.Select
                    value={pFilters.department}
                    onChange={(e) => setPFilters({ ...pFilters, department: e.target.value })}
                  >
                    <option value="">All Departments</option>
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Label className="small fw-semibold text-muted">Status</Form.Label>
                  <Form.Select
                    value={pFilters.status}
                    onChange={(e) => setPFilters({ ...pFilters, status: e.target.value })}
                  >
                    <option value="">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Changes Required">Changes Required</option>
                    <option value="Resubmitted">Resubmitted</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Col>

                <Col md={2}>
                  <Form.Label className="small fw-semibold text-muted">From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={pFilters.fromDate}
                    onChange={(e) => setPFilters({ ...pFilters, fromDate: e.target.value })}
                  />
                </Col>

                <Col md={2}>
                  <Form.Label className="small fw-semibold text-muted">To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={pFilters.toDate}
                    onChange={(e) => setPFilters({ ...pFilters, toDate: e.target.value })}
                  />
                </Col>

                <Col md={2} className="d-flex gap-2">
                  <Button variant="primary" className="w-100 rounded-pill" onClick={fetchProjectReports}>
                    Filter
                  </Button>
                  <Button variant="success" className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-1" onClick={handleExportProjectsCSV}>
                    <Download size={14} /> CSV
                  </Button>
                </Col>
              </Row>
            </Card>

            {pLoading ? (
              <LoadingSpinner text="Compiling project reports..." />
            ) : projectReports.length === 0 ? (
              <div className="text-center py-5 text-muted small">No projects match the selected report criteria.</div>
            ) : (
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light small text-uppercase text-muted">
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Student Leader</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Stage</th>
                    <th>Final Score</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {projectReports.map((p) => (
                    <tr key={p.id}>
                      <td className="fw-bold text-dark">#{p.id} - {p.title}</td>
                      <td><Badge bg="light" text="dark" className="border px-2 py-1">{p.category}</Badge></td>
                      <td>{p.student_leader}</td>
                      <td>{p.department}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td>{p.current_stage}</td>
                      <td className="fw-bold">{p.final_score !== null ? `${p.final_score}%` : 'N/A'}</td>
                      <td>{formatDate(p.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>

          {/* TAB 2: EVALUATION REPORT */}
          <Tab eventKey="evaluations" title="Evaluation & Marks Report" className="p-4" onEnter={fetchEvalReports}>
            <Card className="border bg-light rounded-3 p-3 mb-4">
              <Row className="gy-3 align-items-end">
                <Col md={3}>
                  <Form.Label className="small fw-semibold text-muted">Review Stage</Form.Label>
                  <Form.Select
                    value={eFilters.stageId}
                    onChange={(e) => setEFilters({ ...eFilters, stageId: e.target.value })}
                  >
                    <option value="">All Review Stages</option>
                    {stages.map((stg) => (
                      <option key={stg.id} value={stg.id}>{stg.stage_name}</option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Label className="small fw-semibold text-muted">Review Decision</Form.Label>
                  <Form.Select
                    value={eFilters.decision}
                    onChange={(e) => setEFilters({ ...eFilters, decision: e.target.value })}
                  >
                    <option value="">All Decisions</option>
                    <option value="Approved">Approved</option>
                    <option value="Changes Required">Changes Required</option>
                    <option value="Rejected">Rejected</option>
                  </Form.Select>
                </Col>

                <Col md={2}>
                  <Form.Label className="small fw-semibold text-muted">From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={eFilters.fromDate}
                    onChange={(e) => setEFilters({ ...eFilters, fromDate: e.target.value })}
                  />
                </Col>

                <Col md={2}>
                  <Form.Label className="small fw-semibold text-muted">To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={eFilters.toDate}
                    onChange={(e) => setEFilters({ ...eFilters, toDate: e.target.value })}
                  />
                </Col>

                <Col md={2} className="d-flex gap-2">
                  <Button variant="primary" className="w-100 rounded-pill" onClick={fetchEvalReports}>
                    Filter
                  </Button>
                  <Button variant="success" className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-1" onClick={handleExportEvaluationsCSV}>
                    <Download size={14} /> CSV
                  </Button>
                </Col>
              </Row>
            </Card>

            {eLoading ? (
              <LoadingSpinner text="Compiling evaluation marks..." />
            ) : evalReports.length === 0 ? (
              <div className="text-center py-5 text-muted small">No evaluation records match filter parameters.</div>
            ) : (
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light small text-uppercase text-muted">
                  <tr>
                    <th>Project</th>
                    <th>Stage</th>
                    <th>Faculty Reviewer</th>
                    <th>Student Lead</th>
                    <th>Department</th>
                    <th>Marks (100)</th>
                    <th>Percentage</th>
                    <th>Decision</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {evalReports.map((ev) => (
                    <tr key={ev.review_id}>
                      <td className="fw-bold text-dark">#{ev.project_id} - {ev.project_title}</td>
                      <td><Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-1">{ev.stage_name}</Badge></td>
                      <td>{ev.reviewer_name}</td>
                      <td>{ev.lead_student_name}</td>
                      <td>{ev.student_department}</td>
                      <td className="fw-bold text-dark">{ev.total_marks}</td>
                      <td>{ev.percentage}%</td>
                      <td><StatusBadge status={ev.decision} /></td>
                      <td>{formatDateTime(ev.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Tab>
        </Tabs>
      </Card>
    </div>
  );
};

export default ReportsAnalytics;
