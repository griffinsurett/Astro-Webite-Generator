// src/utils/redirects.js
import { collections } from "~/content/config";
import { getAvailableCollections } from "./collections";

/**
 * Finds if a slug is a collection-level redirect.
 * @param {string} slug
 * @returns {string|null} - Returns the collection name if found, else null.
 */
export function findCollectionRedirect(slug) {
  for (const colName of getAvailableCollections()) {
    const collection = collections[colName];
    if (collection.metadata.redirectFrom && collection.metadata.redirectFrom.includes(slug)) {
      return colName;
    }
  }
  return null;
}

/**
 * Finds if a slug is an item-level redirect.
 * @param {string|null} collection - The collection name if slug includes a prefix, else null.
 * @param {string} slug
 * @returns {{ collection: string, targetSlug: string } | null}
 */
export function findItemRedirect(collection, slug) {
  if (collection && collections[collection]) {
    // Search within the specified collection
    const items = collections[collection].data;
    for (const item of items) {
      if (item.redirectFrom && item.redirectFrom.includes(slug)) {
        return { collection, targetSlug: item.slug };
      }
    }
  } else {
    // Search across all collections
    for (const colName of getAvailableCollections()) {
      const items = collections[colName].data;
      for (const item of items) {
        if (item.redirectFrom && item.redirectFrom.includes(slug)) {
          return { collection: colName, targetSlug: item.slug };
        }
      }
    }
  }
  return null;
}
