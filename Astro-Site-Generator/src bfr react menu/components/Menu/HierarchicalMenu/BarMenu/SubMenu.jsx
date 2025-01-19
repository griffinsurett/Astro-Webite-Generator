// src/components/Menu/HierarchicalMenu/BarMenu/SubMenu.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './sub-menu.css'; // Import the CSS
import Arrow from "../Arrow/Arrow"; // Adjust the path as necessary

const SubMenu = ({ items }) => {
  return (
    <ul className="submenu-list" role="menu">
      {items.map((item) => (
        <li key={item.href} className="submenu-item" role="none">
          <a href={item.href} className="submenu-link" role="menuitem" aria-haspopup={item.children && item.children.length > 0 ? "true" : "false"} aria-expanded="false">
            <span className="submenu-label">{item.label}</span>
            {item.children && item.children.length > 0 && (
              <Arrow /> 
            )}
          </a>
          {item.children && item.children.length > 0 && (
            <SubMenu items={item.children} />
          )}
        </li>
      ))}
    </ul>
  );
};

SubMenu.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      children: PropTypes.array, // Recursive definition
    })
  ).isRequired,
};

export default SubMenu;
