// src/components/Menu/HierarchicalMenu/MenuItem.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import HamburgerSubMenu from './SubMenu.jsx'; // Import the new SubMenu component
import './hamburger-menu.css'; // Ensure this CSS is imported

const MenuItem = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const toggleSubMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <li className={`hamburger-menu-item depth-${depth}`}>
      <div className="hamburger-menu-link-wrapper">
        <a href={item.href} className="hamburger-menu-link">
          {item.label}
        </a>
        {hasChildren && (
          <button
            className="submenu-toggle"
            aria-expanded={isOpen ? 'true' : 'false'}
            onClick={toggleSubMenu}
            aria-label={isOpen ? 'Collapse submenu' : 'Expand submenu'}
          >
            {isOpen ? '▲' : '▼'}
          </button>
        )}
      </div>
      {hasChildren && isOpen && <HamburgerSubMenu items={item.children} depth={depth} />}
    </li>
  );
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  depth: PropTypes.number,
};

MenuItem.defaultProps = {
  depth: 0,
};

export default MenuItem;
