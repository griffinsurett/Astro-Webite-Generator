// src/components/Modal.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * A generic side-drawer modal.
 *
 * Props:
 * - isOpen: boolean controlling open/close
 * - onChange: function called when toggling (receives an event or synthetic toggle)
 * - modalId: unique ID for the modal
 * - width: a string like "75%", "65%", "3/4", "400px", etc. (default "75%")
 * - closeButton: boolean to conditionally render the close (X) button (default false)
 * - children: contents inside the drawer
 */
const Modal = ({
  isOpen,
  onChange,
  modalId = 'site-modal',
  width,
  closeButton = false, // Default to false; can be overridden
  children,
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  const widthClass = `w-${width}`;

  /**
   * Close the modal when the user presses Escape.
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onChange({ target: { checked: false } });
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Save the currently focused element
      previousActiveElement.current = document.activeElement;
      // Shift focus to the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }
      // Prevent background scrolling
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus to the previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
      // Restore background scrolling
      document.body.style.overflow = '';
    };
  }, [isOpen, onChange]);

  /**
   * Handle click on the backdrop to close the modal.
   */
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onChange({ target: { checked: false } });
    }
  };

  /**
   * Handle click on the close button to close the modal.
   */
  const handleCloseClick = () => {
    onChange({ target: { checked: false } });
  };

  return (
    <>
      {/*
        Hidden checkbox controlling open/close
      */}
      <input
        type="checkbox"
        id={modalId}
        className="hidden"
        checked={isOpen}
        onChange={onChange}
      />

      {/*
        The backdrop covers the entire screen.
        Clicking on it (but not on the modal content) closes the modal.
      */}
      {isOpen && (
        <div
          className={`
            fixed inset-0
            z-50
            flex
            items-start
            justify-start
            bg-black bg-opacity-50
            transition-opacity
            duration-300
          `}
          onClick={handleBackdropClick}
          aria-hidden={!isOpen}
        >
          {/*
            Drawer content slides in from the left.
            role="dialog" + aria-modal="true" helps screen readers.
          */}
          <div
            role="dialog"
            aria-modal="true"
            ref={modalRef}
            tabIndex="-1"
            className={`
              relative
              bg-white
              shadow-xl
              h-full
              transform transition-transform duration-300
              ${widthClass}
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}
              focus:outline-none
            `}
          >
            {/* Conditionally render the close (X) button */}
            {closeButton && (
              <button
                onClick={handleCloseClick}
                className="
                  absolute top-4 right-4
                  text-gray-600
                  hover:text-gray-800
                  focus:outline-none
                  focus:ring-2 focus:ring-gray-400
                  rounded
                "
                aria-label="Close modal"
              >
                {/* SVG for the close (X) icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto h-full">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  modalId: PropTypes.string,
  width: PropTypes.string,
  closeButton: PropTypes.bool, // New prop
  children: PropTypes.node,
};

export default Modal;
