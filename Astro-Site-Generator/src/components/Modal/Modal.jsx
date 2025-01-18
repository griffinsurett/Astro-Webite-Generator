// src/components/UI/Modal.jsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import './modal.css'; // Import the modal-specific styles

const Modal = ({ isOpen, onClose, children }) => {
  // Close the modal when the Escape key is pressed
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevent scrolling when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Close the modal when clicking outside the content
  const handleOutsideClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="modal-content" role="dialog" aria-modal="true">
        <button className="modal-close-button" onClick={onClose} aria-label="Close Menu">
          &times;
        </button>
        {children}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;
