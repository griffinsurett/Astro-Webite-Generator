// src/components/Menu/HierarchicalMenu/Arrow/Arrow.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './arrow.css'; // Ensure correct casing and path

const Arrow = ({ direction = 'down' }) => {
  // Apply a class based on the desired initial direction
  const directionClass = direction === 'up' ? 'arrow-up' : 'arrow-down';

  return (
    <span className={`menu-arrow ${directionClass}`} aria-hidden="true">
      ▼
    </span>
  );
};

Arrow.propTypes = {
  /**
   * The direction the arrow should point initially.
   * 'down' for the default downward arrow.
   * 'up' to point the arrow upwards.
   */
  direction: PropTypes.oneOf(['up', 'down']),
};

export default Arrow;
