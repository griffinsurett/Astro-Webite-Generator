// src/components/SubMenu.jsx
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './SubMenu.css'; // Import the CSS

const SubMenu = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const submenuRef = useRef(null);

  // Toggle submenu visibility on click
  const toggleSubMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close submenu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (submenuRef.current && !submenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className="submenu-container"
      ref={submenuRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="submenu-toggle"
        onClick={toggleSubMenu}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        ▼
      </button>
      {isOpen && (
        <ul className="submenu-list">
          {items.map((item) => (
            <li key={item.href} className="submenu-item">
              <a href={item.href} className="submenu-link">
                {item.label}
              </a>
              {item.children && item.children.length > 0 && (
                <SubMenu items={item.children} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
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
