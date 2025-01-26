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
  HamburgerTransform = true, // no longer used for the lines, purely for possible extra logic
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1) Attach a listener to the #hamburger-toggle checkbox (from HamburgerIcon.astro)
  useEffect(() => {
    const checkbox = document.getElementById('hamburger-toggle');
    if (!checkbox) return;

    const handleChange = () => {
      setIsOpen(checkbox.checked);
    };

    checkbox.addEventListener('change', handleChange);
    return () => {
      checkbox.removeEventListener('change', handleChange);
    };
  }, []);

  // 2) Close automatically if screen width > 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        // Uncheck the box, update state
        setIsOpen(false);
        const checkbox = document.getElementById('hamburger-toggle');
        if (checkbox) checkbox.checked = false;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // 3) If isOpen => show the side-drawer Modal
  //    We also pass onChange to close the modal if the user hits ESC or backdrop
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
  HamburgerTransform: PropTypes.bool,
};

export default HamburgerMenu;
