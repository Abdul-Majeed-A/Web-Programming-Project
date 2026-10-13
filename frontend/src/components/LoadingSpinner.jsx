import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ fullPage = false, text = 'Loading...' }) => {
  if (fullPage) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted fw-medium">{text}</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <Spinner animation="border" variant="primary" />
      {text && <p className="mt-2 text-muted small">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
