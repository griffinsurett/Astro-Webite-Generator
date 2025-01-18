// src/components/Menu/HierarchicalMenu/HamburgerMenu/SubMenu.jsx
import React from 'react';
import PropTypes from 'prop-types';
import HamburgerMenuItem from './MenuItem.jsx'; // Import the recursive item component
import './hamburger-menu.css'; // Ensure this CSS is imported

const HamburgerSubMenu = ({ items, depth, isMenuOpen, closeMenu }) => {
  return (
    <ul className={`hamburger-submenu-list depth-${depth}`}>
      {items.map((item) => (
        <HamburgerMenuItem
          key={item.href}
          item={item}
          depth={depth}
          isMenuOpen={isMenuOpen}
          closeMenu={closeMenu}
        />
      ))}
    </ul>
  );
};

HamburgerSubMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      children: PropTypes.arrayOf(PropTypes.object),
    })
  ).isRequired,
  depth: PropTypes.number,
  isMenuOpen: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
};

HamburgerSubMenu.defaultProps = {
  depth: 0,
};

export default HamburgerSubMenu;
