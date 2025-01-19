import React from 'react';
import PropTypes from 'prop-types';

const ReactCard = React.memo(function ReactCard({ title, description, slug, featuredImage, icon }) {
  return (
    <div className="w-full p-4 border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow duration-200 bg-white box-border">
      {featuredImage ? (
        <img
          src={featuredImage}
          alt={title}
          className="w-full h-auto rounded mb-4 object-cover"
        />
      ) : icon ? (
        <div className="text-4xl mb-4 flex items-center justify-center">{icon}</div>
      ) : null}

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-2">{description}</p>
    </div>
  );
});

ReactCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  slug: PropTypes.string.isRequired,
  featuredImage: PropTypes.string,
  icon: PropTypes.string,
};

export default ReactCard;
