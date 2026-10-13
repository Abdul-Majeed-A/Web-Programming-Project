import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/formatters';
import { History, Award, ArrowRight } from 'lucide-react';

const ReviewHistory = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/reports/evaluations'); // If admin or faculty endpoint
        // Let's also check if reports endpoint works or if we fetch faculty reviews
        if (res.data.success) {
          setReviews(res.data.data);
        }
      } catch (err) {
        // Fallback to project reviews or dashboard
        console.error('Failed to fetch review history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner text="Loading evaluation history..." />;

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-extrabold text-dark mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Evaluation History
        </h3>
        <p className="text-muted small mb-0">Record of all previous project milestone evaluations submitted by your account.</p>
      </div>

      <Card className="border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <Card.Body className="p-0">
          {reviews.length === 0 ? (
            <div className="text-center py-5">
              <History size={36} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark">No submitted evaluations found</h6>
              <p className="text-muted small mb-0">Completed reviews will be archived here.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light small text-uppercase text-muted">
                <tr>
                  <th className="ps-4">Project Title</th>
                  <th>Review Stage</th>
                  <th>Student Lead</th>
                  <th>Total Marks (100)</th>
                  <th>Percentage</th>
                  <th>Decision</th>
                  <th>Submitted At</th>
                  <th className="pe-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {reviews.map((r) => (
                  <tr key={r.review_id}>
                    <td className="ps-4 fw-semibold text-dark">{r.project_title}</td>
                    <td>
                      <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1">
                        {r.stage_name}
                      </Badge>
                    </td>
                    <td>{r.lead_student_name}</td>
                    <td className="fw-bold text-dark">{r.total_marks}</td>
                    <td>{r.percentage}%</td>
                    <td><StatusBadge status={r.decision} /></td>
                    <td>{formatDateTime(r.submitted_at)}</td>
                    <td className="pe-4 text-end">
                      <Button as={Link} to={`/faculty/review/${r.project_id}`} variant="outline-primary" size="sm" className="rounded-pill px-3">
                        View Review
                      </Button>
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

export default ReviewHistory;
