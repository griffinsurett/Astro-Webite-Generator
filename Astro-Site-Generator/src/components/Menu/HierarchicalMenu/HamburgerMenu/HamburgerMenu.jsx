// src/components/Menu/HierarchicalMenu/HamburgerMenu/HamburgerMenu.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Modal from '../../../Modal.jsx';
import HamburgerMenuItem from './MenuItem.jsx';

const HamburgerMenu = ({
  queryName,
  Width,
  className = '',
  showCloseButton = false,
  HamburgerTransform = true, // New prop with default value true
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle the modal open/close state
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
      {/* Checkbox controlling the hamburger menu */}
      <input
        type="checkbox"
        id="hamburger-toggle"
        className="hidden"
        checked={isOpen}
        onChange={toggleMenu}
      />

      {/* Hamburger Icon */}
      <label htmlFor="hamburger-toggle" className="flex flex-col justify-between w-8 h-6 cursor-pointer z-1100">
        {/* Line 1 */}
        <span
          className={`block h-0.5 bg-gray-800 transition-transform duration-300 ${
            isOpen && HamburgerTransform ? 'transform rotate-45 translate-y-2.5' : ''
          }`}
        ></span>
        {/* Line 2 */}
        <span
          className={`block h-0.5 bg-gray-800 transition-opacity duration-300 ${
            isOpen && HamburgerTransform ? 'opacity-0' : ''
          }`}
        ></span>
        {/* Line 3 */}
        <span
          className={`block h-0.5 bg-gray-800 transition-transform duration-300 ${
            isOpen && HamburgerTransform ? 'transform -rotate-45 -translate-y-2.5' : ''
          }`}
        ></span>
      </label>

      {/* Modal */}
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
  showCloseButton: PropTypes.bool, // New prop to control close button
  HamburgerTransform: PropTypes.bool, // New prop to control hamburger transformation
};

export default HamburgerMenu;
