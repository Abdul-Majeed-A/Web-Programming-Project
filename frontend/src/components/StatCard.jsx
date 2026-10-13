import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle, trend }) => {
  const colorMap = {
    primary: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    success: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    warning: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
    danger: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' },
    purple: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
    indigo: { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <Card className="border-0 shadow-sm rounded-4 h-100 stat-card-hover transition-all">
      <Card.Body className="p-4 d-flex align-items-center justify-content-between">
        <div>
          <span className="text-muted text-uppercase fw-semibold tracking-wider small">{title}</span>
          <h2 className="mt-2 mb-1 fw-bold text-dark">{value !== undefined && value !== null ? value : 0}</h2>
          {subtitle && <p className="mb-0 text-muted small">{subtitle}</p>}
          {trend && <span className="small text-success fw-medium mt-1 d-inline-block">{trend}</span>}
        </div>
        {Icon && (
          <div
            className="d-flex align-items-center justify-content-center rounded-3 p-3"
            style={{
              backgroundColor: scheme.bg,
              color: scheme.text,
              border: `1px solid ${scheme.border}`,
              width: '54px',
              height: '54px',
            }}
          >
            <Icon size={26} />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatCard;
