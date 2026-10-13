import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="py-5 d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container>
        <Card className="border-0 shadow-sm rounded-4 p-5 text-center mx-auto bg-white" style={{ maxWidth: '500px' }}>
          <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-circle d-inline-flex mx-auto mb-3">
            <FileQuestion size={48} />
          </div>
          <h2 className="fw-bold text-dark mb-2">Page Not Found (404)</h2>
          <p className="text-muted small mb-4">
            The page you are looking for does not exist, has been removed, or is temporarily unavailable.
          </p>
          <div>
            <Button as={Link} to="/" variant="primary" className="rounded-pill px-4 d-inline-flex align-items-center gap-2">
              <Home size={16} /> Return to Homepage
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default NotFound;
