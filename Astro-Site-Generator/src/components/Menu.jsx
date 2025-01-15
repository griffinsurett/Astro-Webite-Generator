// src/components/Menu.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Menu Component
 *
 * Props:
 * - queryName: Array of menu items fetched during build time.
 */
const Menu = ({ queryName }) => {
  return (
    <ul className="hierarchical-menu" role="menubar">
      {queryName.map((item) => (
        <MenuItem key={item.slug} item={item} />
      ))}
    </ul>
  );
};

/**
 * MenuItem Component
 *
 * Recursively renders menu items and their children.
 *
 * Props:
 * - item: The menu item object containing `label`, `href`, `slug`, and optional `children`.
 */
const MenuItem = ({ item }) => {
  const hasChildren = item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  const toggleSubmenu = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <li className="menu-item" role="none">
      <a
        href={item.href}
        className={`menu-link ${isOpen ? 'active' : ''}`}
        role="menuitem"
        aria-haspopup={hasChildren}
        aria-expanded={isOpen}
      >
        {item.label}
      </a>
      {hasChildren && (
        <>
          <button
            className="submenu-toggle"
            onClick={toggleSubmenu}
            aria-haspopup="true"
            aria-expanded={isOpen}
            aria-controls={`submenu-${item.slug}`}
          >
            {isOpen ? '▲' : '▼'}
          </button>
          <ul
            id={`submenu-${item.slug}`}
            className={`submenu ${isOpen ? 'open' : ''}`}
            role="menu"
          >
            {item.children.map((child) => (
              <MenuItem key={child.slug} item={child} />
            ))}
          </ul>
        </>
      )}
    </li>
  );
};

// PropTypes for type checking
Menu.propTypes = {
    queryName: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      children: PropTypes.array, // Recursive definition
    })
  ).isRequired,
};

MenuItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    slug: PropTypes.string.isRequired,
    children: PropTypes.array,
  }).isRequired,
};

export default Menu;

/* 
  Styling for Menu.jsx
  Consider moving this CSS to a separate stylesheet or using CSS Modules for better maintainability.
*/
<style jsx>{`
  .hierarchical-menu,
  .submenu {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .hierarchical-menu {
    display: flex;
    gap: 1rem;
  }

  .menu-item {
    position: relative;
  }

  .menu-link {
    text-decoration: none;
    color: #333;
    padding: 0.5rem 1rem;
    display: block;
    transition: background-color 0.2s, color 0.2s;
  }

  .menu-link:hover,
  .menu-link.active {
    background-color: #007acc;
    color: #fff;
    border-radius: 4px;
  }

  .submenu-toggle {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 0.5rem;
    font-size: 0.8rem;
    color: #333;
  }

  .submenu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #fff;
    border: 1px solid #eaeaea;
    border-radius: 4px;
    min-width: 150px;
    display: none;
    z-index: 1000;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  }

  .submenu.open {
    display: block;
  }

  .submenu .menu-item {
    width: 100%;
  }

  .submenu .menu-link {
    padding: 0.5rem 1rem;
    color: #333;
  }

  .submenu .menu-link:hover,
  .submenu .menu-link.active {
    background-color: #f0f0f0;
    color: #007acc;
  }
`}</style>
