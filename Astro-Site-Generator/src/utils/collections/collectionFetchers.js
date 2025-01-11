// src/utils/collections/collectionFetchers.js
import { collections } from "../../content/config.ts";
import { isValidCollection } from "./collectionHelpers.js";

/**
 * Fetches all items from a specified collection.
 * @param {string} collection - The name of the collection.
 * @returns {Array<Object>} - An array of collection items.
 * @throws {Error} - If the collection is not valid.
 */
export async function fetchCollectionItems(collection) {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }
  return collections[collection].data;
}

/**
 * Fetches a single item by slug from a specified collection.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Object|null} - The collection item or null if not found.
 * @throws {Error} - If the collection is not valid.
 */
export async function fetchCollectionItem(collection, slug) {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }

  const collectionItems = collections[collection]?.data || [];
  const item = collectionItems.find((data) => data.slug === slug);

  if (!item) {
    console.error(
      `Item with slug "${slug}" not found in collection "${collection}"`
    );
  }
  return item || null;
}

/**
 * Retrieves and validates a collection item, throwing a user-friendly error if not found.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Object} - The collection item.
 * @throws {Error} - If the collection or item is invalid/not found.
 */
export async function getValidatedCollectionItem(collection, slug) {
  const item = await fetchCollectionItem(collection, slug);

  if (!item) {
    throw new Error(
      `Item with slug "${slug}" not found in collection "${collection}".`
    );
  }

  return item;
}

/**
 * Fetches all featured items from a specified collection.
 * @param {string} collection - The name of the collection.
 * @returns {Array<Object>} - An array of featured collection items.
 */
export async function fetchFeaturedItems(collection) {
  const items = await fetchCollectionItems(collection);
  return items.filter((item) => item.featured === true);
}
