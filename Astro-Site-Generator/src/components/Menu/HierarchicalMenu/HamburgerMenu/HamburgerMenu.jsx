// src/components/Menu/HierarchicalMenu/HamburgerMenu.jsx
import React from 'react';
import PropTypes from 'prop-types';
import HamburgerMenuItem from './MenuItem.jsx'; // Import the recursive item component
import './hamburger-menu.css'; // Import the CSS

const HamburgerMenu = ({ menuItems }) => {
  return (
    <>
      {/* Hamburger Icon */}
      <input
        type="checkbox"
        id="hamburger-toggle"
        className="hamburger-checkbox"
        // The checked state is managed via CSS
      />
      <label htmlFor="hamburger-toggle" className="hamburger-icon">
        <span className="hamburger-line line1"></span>
        <span className="hamburger-line line2"></span>
        <span className="hamburger-line line3"></span>
      </label>

      {/* Overlay Menu */}
      <nav className="hamburger-menu" aria-label="Mobile Navigation">
        <ul className="hamburger-menu-list">
          {menuItems.map((item) => (
            <HamburgerMenuItem key={item.href} item={item} />
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
};

export default HamburgerMenu;
