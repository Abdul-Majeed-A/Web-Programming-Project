import React from 'react';
import { Card, Badge, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Users, Calendar, ArrowRight, Layers } from 'lucide-react';
import { formatDate } from '../utils/formatters';

const ProjectCard = ({ project, linkPrefix = '/student/projects' }) => {
  // Determine progress percentage based on stage order and status
  const getProgressPercentage = () => {
    if (project.status === 'Approved') return 100;
    if (project.status === 'Rejected') return 100;
    const stageOrder = project.stage_order || 1;
    if (stageOrder === 1) return project.status === 'Draft' ? 10 : 33;
    if (stageOrder === 2) return 66;
    if (stageOrder === 3) return 90;
    return 25;
  };

  const progress = getProgressPercentage();

  return (
    <Card className="border-0 shadow-sm rounded-4 h-100 project-card transition-all">
      <Card.Body className="p-4 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
            <Badge bg="light" text="dark" className="border px-2.5 py-1.5 fw-medium small">
              {project.category || 'General'}
            </Badge>
            <StatusBadge status={project.status} />
          </div>

          <h5 className="fw-bold text-dark mb-2 text-truncate-2">
            <Link to={`${linkPrefix}/${project.id}`} className="text-decoration-none text-dark hover-primary">
              {project.title}
            </Link>
          </h5>

          <p className="text-muted small text-truncate-3 mb-3">
            {project.description || 'No description provided.'}
          </p>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <span className="small text-muted d-flex align-items-center gap-1">
                <Layers size={14} /> {project.stage_name || `Review ${project.current_stage_id || 1}`}
              </span>
              <span className="small fw-semibold text-primary">{progress}%</span>
            </div>
            <ProgressBar now={progress} variant={project.status === 'Approved' ? 'success' : 'primary'} style={{ height: '6px' }} />
          </div>
        </div>

        <div className="pt-3 border-top mt-2 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3 text-muted small">
            {project.creator_name && (
              <span className="d-flex align-items-center gap-1">
                <Users size={14} /> {project.creator_name}
              </span>
            )}
            <span className="d-flex align-items-center gap-1">
              <Calendar size={14} /> {formatDate(project.created_at)}
            </span>
          </div>

          <Link to={`${linkPrefix}/${project.id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-1">
            View <ArrowRight size={14} />
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
