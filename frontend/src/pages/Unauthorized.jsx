import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { user } = useAuth();

  const getHomeRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="py-5 d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container>
        <Card className="border-0 shadow-sm rounded-4 p-5 text-center mx-auto bg-white" style={{ maxWidth: '520px' }}>
          <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle d-inline-flex mx-auto mb-3">
            <ShieldAlert size={48} />
          </div>
          <h2 className="fw-bold text-dark mb-2">Access Denied (403)</h2>
          <p className="text-muted small mb-4">
            You do not have the required permissions to access this page or endpoint. Your current role is <strong>{user?.role || 'Guest'}</strong>.
          </p>
          <div>
            <Button as={Link} to={getHomeRoute()} variant="primary" className="rounded-pill px-4 d-inline-flex align-items-center gap-2">
              <ArrowLeft size={16} /> Return to Your Portal
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Unauthorized;
