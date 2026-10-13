import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertCircle } from 'lucide-react';

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  loading = false,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
          <AlertCircle size={22} className={`text-${confirmVariant}`} />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3 text-muted">
        {message}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onHide} disabled={loading} className="rounded-pill px-3">
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          disabled={loading}
          className="rounded-pill px-4"
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
