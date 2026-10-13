import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowLeft, Save, FileText, Layers, Code2, Target } from 'lucide-react';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    objectives: '',
    technology_stack: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Web Development',
    'Artificial Intelligence & Machine Learning',
    'Mobile Application Development',
    'Internet of Things (IoT)',
    'Blockchain & Cybersecurity',
    'Cloud Computing & DevOps',
    'Data Science & Big Data',
    'Robotics & Automation',
    'Computer Vision & AR/VR',
  ];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        if (res.data.success) {
          const p = res.data.data;
          setFormData({
            title: p.title || '',
            category: p.category || 'Web Development',
            description: p.description || '',
            objectives: p.objectives || '',
            technology_stack: p.technology_stack || '',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load project details for editing.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await api.put(`/projects/${id}`, formData);
      if (res.data.success) {
        navigate(`/student/projects/${id}`);
      } else {
        setError(res.data.message || 'Failed to update project.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error updating project.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading project details..." />;

  return (
    <div>
      <div className="mb-4">
        <Link to={`/student/projects/${id}`} className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2 hover-primary">
          <ArrowLeft size={14} /> Back to Project Overview
        </Link>
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Edit Project Details
        </h3>
        <p className="text-muted small mb-0">Update your project specifications, objectives, or technology stack.</p>
      </div>

      <Row className="justify-content-center">
        <Col lg={9}>
          <Card className="border-0 shadow-sm rounded-4 p-4 bg-white">
            <Card.Body>
              {error && <Alert variant="danger" className="small py-2 rounded-3 mb-4">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row className="gy-3">
                  <Col md={8}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
                        <FileText size={15} /> Project Title *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
                        <Layers size={15} /> Project Category *
                      </Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="py-2"
                        required
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
                        <Code2 size={15} /> Technology Stack *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="technology_stack"
                        value={formData.technology_stack}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
                        <Target size={15} /> Project Objectives *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="objectives"
                        value={formData.objectives}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
                        <FileText size={15} /> Detailed Description & Problem Definition *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                  <Button as={Link} to={`/student/projects/${id}`} variant="light" className="rounded-pill px-4">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving}
                    className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
                  >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EditProject;
