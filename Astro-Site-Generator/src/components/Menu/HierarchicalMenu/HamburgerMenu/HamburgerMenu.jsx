// src/components/Menu/HierarchicalMenu/HamburgerMenu/HamburgerMenu.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../Modal.jsx';
import HamburgerMenuItem from './MenuItem.jsx';

const HamburgerMenu = ({
  queryName,
  Width = '75%',
  className = '',
  showCloseButton = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1) Listen for changes on #hamburger-toggle
  useEffect(() => {
    const checkbox = document.getElementById('hamburger-toggle');
    if (!checkbox) return;

    const handleChange = () => {
      setIsOpen(checkbox.checked);
    };

    checkbox.addEventListener('change', handleChange);
    return () => checkbox.removeEventListener('change', handleChange);
  }, []);

  // 2) Close if the window is resized above 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
        const checkbox = document.getElementById('hamburger-toggle');
        if (checkbox) checkbox.checked = false;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // 3) Called by the <Modal> if user hits ESC or backdrop
  const closeModal = () => {
    setIsOpen(false);
    const checkbox = document.getElementById('hamburger-toggle');
    if (checkbox) checkbox.checked = false;
  };

  return (
    <div className={`relative ${className}`}>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onChange={closeModal}
          modalId="hamburger-menu-modal"
          width={Width}
          closeButton={showCloseButton}
        >
          <nav>
            <ul className="p-4">
              {queryName.map((item) => (
                <HamburgerMenuItem
                  key={item.href}
                  item={item}
                  depth={0}
                  isMenuOpen={isOpen}
                  closeMenu={closeModal}
                />
              ))}
            </ul>
          </nav>
        </Modal>
      )}
    </div>
  );
};

HamburgerMenu.propTypes = {
  queryName: PropTypes.array.isRequired,
  Width: PropTypes.string,
  className: PropTypes.string,
  showCloseButton: PropTypes.bool,
};

export default HamburgerMenu;
