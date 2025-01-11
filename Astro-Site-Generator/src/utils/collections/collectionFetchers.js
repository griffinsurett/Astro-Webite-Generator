// src/utils/collections/collectionFetchers.js
import { collections } from "../../content/config.ts";
import { isValidCollection } from "./collectionHelpers.js";

/**
 * Fetches all items from a specified collection.
 */
export async function fetchCollectionItems(collection) {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }
  return collections[collection].data;
}

/**
 * Fetches a single item by slug from a specified collection.
 */
export async function fetchCollectionItem(collection, slug) {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }
  const items = collections[collection]?.data || [];
  return items.find((data) => data.slug === slug) || null;
}

/**
 * Retrieves and validates a collection item, throwing if not found.
 */
export async function getValidatedCollectionItem(collection, slug) {
  const item = await fetchCollectionItem(collection, slug);
  if (!item) {
    throw new Error(`Item with slug "${slug}" not found in "${collection}".`);
  }
  return item;
}

/**
 * Fetches all featured items from a specified collection.
 */
export async function fetchFeaturedItems(collection) {
  const items = await fetchCollectionItems(collection);
  return items.filter((item) => item.featured === true);
}
