// src/utils/collections.js

import { getCollection, getEntry } from 'astro:content';
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
 * @returns {Promise<Array>} - An array of collection items.
 */
export const fetchCollectionItems = async (collection) => {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }
  return await getCollection(collection);
};

/**
 * Fetches a single item by slug from a specified collection.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Promise<Object|null>} - The collection item or null if not found.
 */
export const fetchCollectionItem = async (collection, slug) => {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }
  return await getEntry(collection, slug);
};

/**
 * Generates static paths for all collections.
 * @returns {Promise<Array>} - An array of path objects.
 */
export const generateCollectionPaths = async () => {
  const availableCollections = getAvailableCollections();
  return availableCollections.map((col) => ({
    params: { collection: col },
  }));
};

/**
 * Generates static paths for all items in all collections.
 * @returns {Promise<Array>} - An array of path objects.
 */
export const generateItemPaths = async () => {
  const availableCollections = getAvailableCollections();
  const paths = [];

  for (const col of availableCollections) {
    const items = await getCollection(col);
    items.forEach((item) => {
      paths.push({
        params: {
          collection: col,
          slug: item.slug,
        },
      });
    });
  }

  return paths;
};

/**
 * Retrieves and validates a collection item, throwing a user-friendly error if not found.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Promise<Object>} - The collection item.
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
