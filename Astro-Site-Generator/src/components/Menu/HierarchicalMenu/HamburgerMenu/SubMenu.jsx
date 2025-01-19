// src/components/Menu/HierarchicalMenu/HamburgerMenu/SubMenu.jsx
import React from 'react';
import PropTypes from 'prop-types';
import HamburgerMenuItem from './MenuItem.jsx';

const HamburgerSubMenu = ({ items, depth, isMenuOpen, closeMenu }) => {
  // Calculate padding based on depth
  const paddingLeft = depth * 4; // Tailwind uses multiples of 4 (e.g., 1rem = pl-4)

  return (
    <ul
      className={`list-none pl-${paddingLeft} mt-2 border-l-2 border-gray-200`}
    >
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
  items: PropTypes.array.isRequired,
  depth: PropTypes.number,
  isMenuOpen: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
};

HamburgerSubMenu.defaultProps = {
  depth: 0,
};

export default HamburgerSubMenu;
