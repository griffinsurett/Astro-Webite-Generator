import React from 'react';
import PropTypes from 'prop-types';

const HamburgerIcon = ({ isOpen, transform, toggleMenu }) => {
  return (
    <>
      {/* Hidden checkbox controlling the hamburger menu */}
      <input
        type="checkbox"
        id="hamburger-toggle"
        className="hidden"
        checked={isOpen}
        onChange={toggleMenu}
      />

      {/* The clickable label (the 3 lines) */}
      <label
        htmlFor="hamburger-toggle"
        className="flex flex-col justify-between w-8 h-6 cursor-pointer z-1100"
      >
        {/* Line 1 */}
        <span
          className={`block h-0.5 bg-gray-800 transition-transform duration-300 ${
            isOpen && transform ? 'transform rotate-45 translate-y-2.5' : ''
          }`}
        ></span>
        {/* Line 2 */}
        <span
          className={`block h-0.5 bg-gray-800 transition-opacity duration-300 ${
            isOpen && transform ? 'opacity-0' : ''
          }`}
        ></span>
        {/* Line 3 */}
        <span
          className={`block h-0.5 bg-gray-800 transition-transform duration-300 ${
            isOpen && transform ? 'transform -rotate-45 -translate-y-2.5' : ''
          }`}
        ></span>
      </label>
    </>
  );
};

HamburgerIcon.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  transform: PropTypes.bool,
  toggleMenu: PropTypes.func.isRequired,
};

HamburgerIcon.defaultProps = {
  transform: true,
};

export default HamburgerIcon;
