// src/components/Menu/HierarchicalMenu/HamburgerMenu/HamburgerMenu.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import HamburgerMenuItem from './MenuItem.jsx'; // Import the recursive item component
import './hamburger-menu.css'; // Import the CSS

const HamburgerMenu = ({ menuItems, Width = '75%' }) => { // Renamed prop to 'Width' for clarity
  const [isOpen, setIsOpen] = useState(false);

  // Toggle menu open state
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close the menu (used when a link is clicked)
  const closeMenu = () => {
    setIsOpen(false);
  };

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Icon */}
      <input
        type="checkbox"
        id="hamburger-toggle"
        className="hamburger-checkbox"
        checked={isOpen}
        onChange={toggleMenu}
      />
      <label htmlFor="hamburger-toggle" className="hamburger-icon">
        <span className="hamburger-line line1"></span>
        <span className="hamburger-line line2"></span>
        <span className="hamburger-line line3"></span>
      </label>

      {/* Overlay Menu */}
      <nav
        className={`hamburger-menu ${isOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation"
        style={{ '--hamburger-menu-width': Width }} // Setting the CSS variable
      >
        <ul className="hamburger-menu-list">
          {menuItems.map((item) => (
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
    </>
  );
};

HamburgerMenu.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      children: PropTypes.arrayOf(PropTypes.object),
    })
  ).isRequired,
  Width: PropTypes.string, // Renamed prop type
};

export default HamburgerMenu;
