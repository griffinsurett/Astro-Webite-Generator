import React from 'react';
import PropTypes from 'prop-types';

/**
 * A generic React card component that displays 
 * typical fields from your query items.
 *
 * Props come directly from the slider, 
 * which passes each item’s data.
 */
function ReactCard({ title, description, slug, featuredImage, icon }) {
  return (
    <div className="w-full h-full p-4 border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
      {/* Optional icon or featured image */}
      {featuredImage ? (
        <img
          src={featuredImage}
          alt={title}
          className="w-full h-auto rounded mb-4"
        />
      ) : icon ? (
        <div className="text-4xl mb-4">{icon}</div>
      ) : null}

      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 mb-2">{description}</p>

      {/* Possibly link to a detail page using slug */}
      <a
        href={`/${slug}`}
        className="inline-block mt-3 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors no-underline"
      >
        Learn More
      </a>
    </div>
  );
}

ReactCard.propTypes = {
  /** Typically the main title of the item */
  title: PropTypes.string.isRequired,
  /** Short descriptive text */
  description: PropTypes.string,
  /** The slug for linking to the item's detail page */
  slug: PropTypes.string.isRequired,
  /** Optional image URL */
  featuredImage: PropTypes.string,
  /** Optional icon (emoji, or text) */
  icon: PropTypes.string,
};

export default ReactCard;
