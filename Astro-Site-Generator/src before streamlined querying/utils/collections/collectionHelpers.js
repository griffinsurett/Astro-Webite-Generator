// src/utils/collections/collectionHelpers.js
import { collections } from "../../content/config.ts";

/**
 * Returns an array of available collections dynamically.
 * @returns {Array<string>} - List of collection names.
 */
export function getAvailableCollections() {
  return Object.keys(collections);
}

/**
 * Validates if a given collection exists.
 * @param {string} collection - The name of the collection to validate.
 * @returns {boolean} - Returns true if the collection exists, false otherwise.
 */
export function isValidCollection(collection) {
  const availableCollections = getAvailableCollections();
  return availableCollections.includes(collection);
}

/**
 * Formats the collection name for display (e.g., capitalizes the first letter).
 * @param {string} collection - The name of the collection.
 * @returns {string} - The formatted collection name.
 */
export function formatCollectionName(collection) {
  if (!collection) return "";
  return collection.charAt(0).toUpperCase() + collection.slice(1);
}
