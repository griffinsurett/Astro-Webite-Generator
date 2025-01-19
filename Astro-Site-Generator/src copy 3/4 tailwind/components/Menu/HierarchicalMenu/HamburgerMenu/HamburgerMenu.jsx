import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import HamburgerMenuItem from './MenuItem.jsx';
import './hamburger-menu.css';

const HamburgerMenu = ({ menuItems, Width = '75%', className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && isOpen) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  return (
    <>
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

      <nav
        className={`hamburger-menu-overlay ${isOpen ? 'open' : ''} ${className}`}
        aria-label="Mobile Navigation"
        style={{ '--hamburger-menu-width': Width }}
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
  menuItems: PropTypes.array.isRequired,
  Width: PropTypes.string,
  className: PropTypes.string,
};

HamburgerMenu.defaultProps = {
  Width: '75%',
  className: "",
};

export default HamburgerMenu;
