// src/utils/collections/collectionFetchers.js

import { collections } from "../../content/config.ts";
import { isValidCollection } from "./collectionHelpers.js";

// 1) Small helper: sets `item.hasPage` if undefined
function normalizeItemHasPage(item, defaultHasPage) {
  // If the item did not set hasPage explicitly, default to itemsHasPage
  if (typeof item.hasPage === "undefined") {
    item.hasPage = defaultHasPage;
  }
  return item;
}

/**
 * Fetches all items from a specified collection.
 */
export async function fetchCollectionItems(collection) {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }
  const colObj = collections[collection];
  const { itemsHasPage } = colObj.metadata;

  // Return a shallow copy of each item but with hasPage normalized
  return colObj.data.map((origItem) =>
    normalizeItemHasPage({ ...origItem }, itemsHasPage)
  );
}

/**
 * Fetches a single item by slug from a specified collection.
 */
export async function fetchCollectionItem(collection, slug) {
  if (!isValidCollection(collection)) {
    throw new Error(`Collection "${collection}" is not valid.`);
  }

  const colObj = collections[collection];
  const { itemsHasPage } = colObj.metadata;
  const found = colObj.data.find((data) => data.slug === slug) || null;

  // Normalize hasPage if found
  if (found) {
    return normalizeItemHasPage({ ...found }, itemsHasPage);
  }
  return null;
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
