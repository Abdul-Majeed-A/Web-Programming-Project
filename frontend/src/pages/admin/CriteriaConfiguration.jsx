import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Button, Row, Col, Alert, Badge } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SlidersHorizontal, CheckCircle, Save } from 'lucide-react';

const CriteriaConfiguration = () => {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchStages = async () => {
    try {
      const res = await api.get('/reviews/stages');
      if (res.data.success) {
        setStages(res.data.data);
      }
    } catch (err) {
      setError('Failed to load review stages and criteria.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  const handleWeightChange = (stageId, newWeight) => {
    setStages((prev) =>
      prev.map((s) => (s.id === stageId ? { ...s, weightage: newWeight } : s))
    );
  };

  const handleSaveStage = async (stage) => {
    setSavingId(stage.id);
    setError('');
    setMessage('');
    try {
      const res = await api.put(`/reviews/stages/${stage.id}`, {
        weightage: parseFloat(stage.weightage),
        description: stage.description,
      });
      if (res.data.success) {
        setMessage(`Stage "${stage.stage_name}" updated successfully.`);
      }
    } catch (err) {
      setError('Failed to update stage configuration.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading review rubrics and criteria..." />;

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Review Stages & Evaluation Criteria Configuration
        </h3>
        <p className="text-muted small mb-0">Customize institutional review rubrics, maximum marks validation rules, and aggregate stage weightages.</p>
      </div>

      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')} className="rounded-3 mb-4">
          <CheckCircle size={16} className="me-2 d-inline" /> {message}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')} className="rounded-3 mb-4">
          {error}
        </Alert>
      )}

      <Row className="gy-4">
        {stages.map((stg) => {
          const totalMax = stg.criteria?.reduce((sum, c) => sum + Number(c.maximum_marks), 0) || 100;
          return (
            <Col lg={4} key={stg.id}>
              <Card className="border-0 shadow-sm rounded-4 h-100 bg-white p-4">
                <Card.Body className="p-0 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge bg="primary" pill className="px-3 py-1.5">
                        Stage {stg.stage_order}
                      </Badge>
                      <span className="fw-bold text-dark fs-6">
                        Total: {totalMax} Marks
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-1">{stg.stage_name}</h5>
                    <p className="text-muted small mb-3">{stg.description}</p>

                    <div className="bg-light p-3 rounded-3 mb-3 border">
                      <Form.Group className="d-flex align-items-center justify-content-between">
                        <Form.Label className="small fw-semibold text-muted mb-0">Weightage (%):</Form.Label>
                        <Form.Control
                          type="number"
                          step="0.01"
                          style={{ width: '100px' }}
                          value={stg.weightage}
                          onChange={(e) => handleWeightChange(stg.id, e.target.value)}
                          className="py-1 text-center fw-bold"
                        />
                      </Form.Group>
                    </div>

                    <h6 className="fw-bold text-dark mb-2 small text-uppercase tracking-wider">Evaluation Rubric Criteria</h6>
                    <Table size="sm" bordered hover className="align-middle mb-4">
                      <thead className="table-light small">
                        <tr>
                          <th>Criterion</th>
                          <th style={{ width: '80px' }} className="text-center">Max</th>
                        </tr>
                      </thead>
                      <tbody className="small">
                        {stg.criteria?.map((c) => (
                          <tr key={c.id}>
                            <td className="text-secondary">{c.criterion_name}</td>
                            <td className="text-center fw-bold text-primary">{c.maximum_marks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="w-100 rounded-pill d-flex align-items-center justify-content-center gap-1.5"
                    onClick={() => handleSaveStage(stg)}
                    disabled={savingId === stg.id}
                  >
                    <Save size={15} /> {savingId === stg.id ? 'Saving...' : 'Save Configuration'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default CriteriaConfiguration;
