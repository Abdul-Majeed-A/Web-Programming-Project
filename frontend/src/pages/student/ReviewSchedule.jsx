import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Row, Col } from 'react-bootstrap';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatters';
import { Calendar, Video, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await api.get('/schedules');
        if (res.data.success) {
          setSchedules(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch review schedules:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  if (loading) return <LoadingSpinner text="Loading review schedules..." />;

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          My Review Schedules
        </h3>
        <p className="text-muted small mb-0">Upcoming dates and locations for your project milestone reviews.</p>
      </div>

      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Body className="p-0">
          {schedules.length === 0 ? (
            <div className="text-center py-5">
              <Calendar size={36} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark">No review sessions scheduled</h6>
              <p className="text-muted small mb-0">Review schedules created by the department administrator will appear here.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th className="ps-4">Project Title</th>
                  <th>Review Stage</th>
                  <th>Scheduled Date & Time</th>
                  <th>Venue / Online Link</th>
                  <th>Notes</th>
                  <th>Status</th>
                  <th className="pe-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td className="ps-4 fw-semibold text-dark">
                      <Link to={`/student/projects/${s.project_id}`} className="text-decoration-none text-dark hover-primary">
                        {s.project_title}
                      </Link>
                    </td>
                    <td>
                      <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
                        {s.stage_name}
                      </Badge>
                    </td>
                    <td className="fw-medium text-dark">{formatDateTime(s.scheduled_at)}</td>
                    <td>
                      {s.location_or_meeting_link ? (
                        <div className="d-flex align-items-center gap-1.5 text-secondary">
                          <Video size={14} className="text-primary flex-shrink-0" />
                          <span className="text-truncate" style={{ maxWidth: '240px' }}>{s.location_or_meeting_link}</span>
                        </div>
                      ) : (
                        'To Be Announced'
                      )}
                    </td>
                    <td className="text-muted">{s.notes || '—'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="pe-4 text-end">
                      <Link to={`/student/projects/${s.project_id}`} className="btn btn-sm btn-outline-primary rounded-pill px-3">
                        View Project
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

export default ReviewSchedule;
