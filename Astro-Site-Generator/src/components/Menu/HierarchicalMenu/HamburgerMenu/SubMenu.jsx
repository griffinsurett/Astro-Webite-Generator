// src/components/Menu/HierarchicalMenu/SubMenu.jsx
import React from 'react';
import PropTypes from 'prop-types';
import HamburgerMenuItem from './MenuItem.jsx'; // Import the recursive item component
import './hamburger-menu.css'; // Ensure this CSS is imported

const SubMenu = ({ items, depth }) => {
  return (
    <ul className={`hamburger-submenu-list depth-${depth}`}>
      {items.map((item) => (
        <HamburgerMenuItem key={item.href} item={item} depth={depth + 1} />
      ))}
    </ul>
  );
};

SubMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      children: PropTypes.arrayOf(PropTypes.object),
    })
  ).isRequired,
  depth: PropTypes.number,
};

SubMenu.defaultProps = {
  depth: 0,
};

export default SubMenu;
