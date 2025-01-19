import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import HamburgerSubMenu from "./SubMenu.jsx";
import Arrow from "../Arrow/Arrow.jsx";
import "./hamburger-menu.css";

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
    <li className={`hamburger-menu-item depth-${depth}`}>
      <div className="hamburger-menu-link-wrapper">
        <a
          href={item.href}
          className="hamburger-menu-link"
          onClick={closeMenu}
        >
          {item.label}
        </a>
        {hasChildren && (
          <button
            className="submenu-toggle"
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
