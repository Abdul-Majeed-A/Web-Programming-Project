export const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'Draft':
      return 'secondary';
    case 'Submitted':
      return 'info';
    case 'Under Review':
      return 'primary';
    case 'Changes Required':
      return 'warning';
    case 'Resubmitted':
      return 'info';
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'danger';
    case 'Scheduled':
      return 'primary';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
