import React from 'react';
import PropTypes from 'prop-types';
import './arrow.css'; // leftover if you want the old CSS for arrow rotation

const Arrow = ({ direction = 'down' }) => {
  const directionClass = direction === 'up' ? 'arrow-up' : 'arrow-down';
  return (
    <span className={`menu-arrow ${directionClass}`} aria-hidden="true">
      ▼
    </span>
  );
};

Arrow.propTypes = {
  direction: PropTypes.oneOf(['up', 'down']),
};

export default Arrow;
