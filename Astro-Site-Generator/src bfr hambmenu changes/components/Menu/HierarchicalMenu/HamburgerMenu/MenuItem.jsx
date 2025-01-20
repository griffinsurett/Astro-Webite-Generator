// src/components/Menu/HierarchicalMenu/HamburgerMenu/MenuItem.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import HamburgerSubMenu from "./SubMenu.jsx";
import Arrow from "../Arrow/Arrow.jsx";

const HamburgerMenuItem = ({ item, depth = 0, isMenuOpen, closeMenu }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  const toggleSubMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (!isMenuOpen && isOpen) setIsOpen(false);
  }, [isMenuOpen, isOpen]);

  return (
    <li className="mb-4">
      <div className="flex justify-between items-center">
        <a
          href={item.href}
          className="text-gray-800 text-lg hover:text-blue-500 focus:text-blue-500 transition-colors duration-200"
          onClick={closeMenu}
        >
          {item.label}
        </a>
        {hasChildren && (
          <button
            className="bg-transparent border-none cursor-pointer p-2 flex items-center justify-center text-gray-800 hover:text-blue-500 focus:text-blue-500 transition-colors duration-200"
            aria-expanded={isOpen ? "true" : "false"}
            onClick={toggleSubMenu}
            aria-label={isOpen ? "Collapse submenu" : "Expand submenu"}
          >
            <Arrow direction={isOpen ? "up" : "down"} />
          </button>
        )}
      </div>
      {hasChildren && isOpen && (
        <HamburgerSubMenu
          items={item.children}
          depth={depth + 1}
          isMenuOpen={isMenuOpen}
          closeMenu={closeMenu}
        />
      )}
    </li>
  );
};

HamburgerMenuItem.propTypes = {
  item: PropTypes.shape({
    label: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
    children: PropTypes.array,
  }).isRequired,
  depth: PropTypes.number,
  isMenuOpen: PropTypes.bool.isRequired,
  closeMenu: PropTypes.func.isRequired,
};

export default HamburgerMenuItem;
