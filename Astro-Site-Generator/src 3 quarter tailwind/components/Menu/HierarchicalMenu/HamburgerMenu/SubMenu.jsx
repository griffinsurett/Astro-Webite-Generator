import React from 'react';
import PropTypes from 'prop-types';
import HamburgerMenuItem from './MenuItem.jsx';
import './hamburger-menu.css';

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
  items: PropTypes.array.isRequired,
  depth: PropTypes.number,
  isMenuOpen: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
};

HamburgerSubMenu.defaultProps = {
  depth: 0,
};

export default HamburgerSubMenu;
