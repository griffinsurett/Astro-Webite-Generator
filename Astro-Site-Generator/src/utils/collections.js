// src/utils/collections.js

import { collections } from '../content/config'; // Import the collections from config.ts

/**
 * Returns an array of available collections dynamically.
 */
export const getAvailableCollections = () => {
  return Object.keys(collections);
};

/**
 * Validates if a given collection exists.
 * @param {string} collection - The name of the collection to validate.
 * @returns {boolean} - Returns true if the collection exists, false otherwise.
 */
export const isValidCollection = (collection) => {
  const availableCollections = getAvailableCollections();
  return availableCollections.includes(collection);
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

/**
 * Fetches all items from a specified collection.
 * @param {string} collection - The name of the collection.
 * @returns {Array} - An array of collection items.
 */
export const fetchCollectionItems = async (collection) => {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }
  return collections[collection].data;
};

/**
 * Fetches a single item by slug from a specified collection.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Object|null} - The collection item or null if not found.
 */
export const fetchCollectionItem = async (collection, slug) => {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }

  // Debugging output
  console.log(`Fetching item with slug "${slug}" from collection "${collection}"`);

  const collectionItems = collections[collection]?.data || [];
  console.log('Available items:', collectionItems);

  const item = collectionItems.find((item) => item.slug === slug);

  if (!item) {
    console.error(`Item with slug "${slug}" not found in collection "${collection}"`);
  }

  return item || null;
};

/**
 * Generates static paths for all collections.
 * @returns {Array} - An array of path objects.
 */
export const generateCollectionPaths = async () => {
  const availableCollections = getAvailableCollections();
  return availableCollections.map((col) => ({
    params: { collection: col },
  }));
};

/**
 * Generates static paths for all items in all collections.
 * @returns {Array} - An array of path objects.
 */
export const generateItemPaths = async () => {
  const paths = [];

  for (const [collectionName, collection] of Object.entries(collections)) {
    if (collection.metadata.itemsHasPage) {
      collection.data.forEach((item) => {
        const path = {
          params: {
            collection: collectionName,
            slug: item.slug,
          },
        };
        console.log('Generated Path:', path); // Debugging output
        paths.push(path);
      });
    }
  }

  return paths;
};

/**
 * Retrieves and validates a collection item, throwing a user-friendly error if not found.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Object} - The collection item.
 * @throws {Error} - If the collection or item is invalid/not found.
 */
export const getValidatedCollectionItem = async (collection, slug) => {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" not found.`);
  }

  const item = await fetchCollectionItem(collection, slug);

  if (!item) {
    throw new Error(`Item with slug "${slug}" not found in collection "${collection}".`);
  }

  return item;
};
