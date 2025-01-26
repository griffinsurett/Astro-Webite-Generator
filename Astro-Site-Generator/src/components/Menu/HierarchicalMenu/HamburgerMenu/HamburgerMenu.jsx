// src/components/Menu/HierarchicalMenu/HamburgerMenu/HamburgerMenu.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../Modal.jsx';
import HamburgerMenuItem from './MenuItem.jsx';
import HamburgerIcon from './HamburgerIcon.jsx';

const HamburgerMenu = ({
  queryName,
  Width,
  className = '',
  showCloseButton = false,
  HamburgerTransform = true, // default: transform lines on open
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggles the modal open/close state
  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  // Close automatically if screen width exceeds 768px
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      {/* Hamburger icon + hidden checkbox */}
      <HamburgerIcon
        isOpen={isOpen}
        transform={HamburgerTransform}
        toggleMenu={toggleMenu}
      />

      {/* Side-drawer modal */}
      <Modal
        isOpen={isOpen}
        onChange={toggleMenu}
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
                closeMenu={closeMenu}
              />
            ))}
          </ul>
        </nav>
      </Modal>
    </div>
  );
};

HamburgerMenu.propTypes = {
  queryName: PropTypes.array.isRequired,
  Width: PropTypes.string, // e.g., "75%", "65%", etc.
  className: PropTypes.string,
  showCloseButton: PropTypes.bool, // controls the close (X) button in Modal
  HamburgerTransform: PropTypes.bool, // controls the line rotation animation
};

export default HamburgerMenu;
