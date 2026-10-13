import React, { useState } from 'react';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { ArrowLeft, PlusCircle, CheckCircle, Layers, Code2, Target, FileText } from 'lucide-react';

const CreateProject = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    description: '',
    objectives: '',
    technology_stack: '',
  });

  const [loading, setLoading] = useState(false);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.objectives || !formData.technology_stack) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/projects', formData);
      if (res.data.success) {
        navigate(`/student/projects/${res.data.projectId}`);
      } else {
        setError(res.data.message || 'Failed to create project.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error while creating project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Link to="/student/projects" className="text-decoration-none text-muted small d-inline-flex align-items-center gap-1 mb-2 hover-primary">
          <ArrowLeft size={14} /> Back to Projects
        </Link>
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Create New Project Proposal
        </h3>
        <p className="text-muted small mb-0">
          Register your software project for Review 1 (Proposal Review). You can add team members and upload documents after creation.
        </p>
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
                        placeholder="e.g. AI-Powered Healthcare Diagnostic Assistant"
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
                        placeholder="e.g. React, Node.js, Express, MySQL, PyTorch, Docker"
                        required
                        className="py-2"
                      />
                      <Form.Text className="text-muted small">
                        Comma-separated list of frameworks, databases, libraries, and languages.
                      </Form.Text>
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
                        placeholder="1. Build real-time chest X-ray classifier&#10;2. Implement DICOM image viewer&#10;3. Achieve 90%+ diagnostic sensitivity"
                        required
                        className="py-2"
                      />
                      <Form.Text className="text-muted small">
                        Enumerate measurable technical goals for evaluation against progress reviews.
                      </Form.Text>
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
                        placeholder="Provide an overview of the real-world problem, existing limitations, proposed software solution, and target user audience..."
                        required
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top">
                  <Button as={Link} to="/student/projects" variant="light" className="rounded-pill px-4">
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    className="rounded-pill px-4 shadow-sm d-flex align-items-center gap-2"
                  >
                    <CheckCircle size={18} /> {loading ? 'Saving Project...' : 'Create Project in Draft Mode'}
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

export default CreateProject;
