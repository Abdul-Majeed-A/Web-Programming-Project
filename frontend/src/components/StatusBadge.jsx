import React from 'react';
import { Badge } from 'react-bootstrap';
import { getStatusBadgeVariant } from '../utils/formatters';

const StatusBadge = ({ status, className = '' }) => {
  const variant = getStatusBadgeVariant(status);
  
  // Custom styles for enhanced modern badge aesthetics
  const getCustomBadgeStyle = () => {
    switch (status) {
      case 'Approved':
        return { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' };
      case 'Changes Required':
        return { backgroundColor: '#fef3c7', color: '#b45309', border: '1px solid #fde68a' };
      case 'Under Review':
        return { backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' };
      case 'Submitted':
      case 'Resubmitted':
        return { backgroundColor: '#ede9fe', color: '#6d28d9', border: '1px solid #ddd6fe' };
      case 'Rejected':
        return { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' };
      case 'Draft':
        return { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' };
      default:
        return {};
    }
  };

  return (
    <Badge
      bg={variant}
      pill
      className={`px-3 py-2 fw-semibold text-capitalize ${className}`}
      style={getCustomBadgeStyle()}
    >
      {status || 'Unknown'}
    </Badge>
  );
};

export default StatusBadge;
