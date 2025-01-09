// src/utils/collections.js

/**
 * Returns an array of available collections.
 * Update this array when adding new collections.
 */
export const getAvailableCollections = () => {
    return ['services']; // Add new collection names as needed, e.g., 'products', 'blogs'
  };
  
  /**
   * Validates if a given collection exists.
   * @param {string} collection - The name of the collection to validate.
   * @returns {boolean} - Returns true if the collection exists, false otherwise.
   */
  export const isValidCollection = (collection) => {
    const collections = getAvailableCollections();
    return collections.includes(collection);
  };
  
  /**
   * Formats the collection name for display (e.g., capitalizes the first letter).
   * @param {string} collection - The name of the collection.
   * @returns {string} - The formatted collection name.
   */
  export const formatCollectionName = (collection) => {
    if (!collection) return '';
    return collection.charAt(0).toUpperCase() + collection.slice(1);
  };
  