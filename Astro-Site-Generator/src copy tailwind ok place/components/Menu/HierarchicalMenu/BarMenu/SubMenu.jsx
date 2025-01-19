import React from 'react';
import PropTypes from 'prop-types';
import './sub-menu.css';  // We'll update inside to use @screen max-md
import Arrow from "../Arrow/Arrow";

const SubMenu = ({ items }) => {
  return (
    <ul className="submenu-list" role="menu">
      {items.map((item) => (
        <li key={item.href} className="submenu-item" role="none">
          <a
            href={item.href}
            className="
              submenu-link 
              flex items-center justify-between 
              no-underline text-gray-333
              px-4 py-2
              hover:bg-gray-f0
            "
            role="menuitem"
            aria-haspopup={item.children && item.children.length > 0 ? "true" : "false"}
            aria-expanded="false"
          >
            <span className="submenu-label flex-grow">{item.label}</span>
            {item.children && item.children.length > 0 && <Arrow />}
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
  items: PropTypes.array.isRequired,
};

export default SubMenu;
