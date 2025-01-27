// src/components/Menu/HierarchicalMenu/HamburgerMenu/HamburgerMenu.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../Modal.jsx';
import HamburgerMenuItem from './MenuItem.jsx';

const HamburgerMenu = ({
  queryName,
  Width = '75%',          // e.g. "60%", "400px", etc.
  className = '',
  showCloseButton = true,  // Add an (X) inside the side-drawer
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // 1. Attach a listener to #hamburger-toggle so we know if it's checked
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

  // 2. Close automatically if screen width > 768px
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768 && isOpen) {
        // uncheck the box to hide the menu
        setIsOpen(false);
        const checkbox = document.getElementById('hamburger-toggle');
        if (checkbox) {
          checkbox.checked = false;
        }
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  // 3. Provide a function to close from the modal's onChange (ESC / backdrop)
  const closeModal = () => {
    setIsOpen(false);
    const checkbox = document.getElementById('hamburger-toggle');
    if (checkbox) {
      checkbox.checked = false;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/*
        We only render the <Modal> if isOpen = true.
        The hamburger icon is Astro-based, so it's always in the DOM.
      */}
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onChange={closeModal}   // Called if user hits ESC or backdrop
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
  HamburgerTransform: PropTypes.bool, // we keep this if you want to pass it in
};

export default HamburgerMenu;
