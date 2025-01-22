// src/utils/sections.js
import { collections, homepageSections } from "../content/config";

/**
 * Return the root-level sections from a collection’s metadata.
 * These apply to the collection root page (e.g., /services).
 */
export function getCollectionSections(collectionName) {
  const colObj = collections[collectionName];
  if (!colObj) {
    console.warn(`No collection found for "${collectionName}".`);
    return [];
  }

  // Return metadata.sections if defined; otherwise empty array.
  return colObj.metadata.sections || [];
}

/**
 * Return the item-level sections for a specific item in a collection.
 * These apply to an individual item’s detail page (e.g., /services/web-design).
 *
 * - If the item defines its own `sections` array, use it.
 * - Otherwise, use the collection’s `itemsSections` array.
 * - If both are undefined, return an empty array.
 */
export function getItemSections(collectionName, slug) {
  const colObj = collections[collectionName];
  if (!colObj) {
    console.warn(`No collection found for "${collectionName}".`);
    return [];
  }

  // Find the requested item by slug
  const item = colObj.data.find((i) => i.slug === slug);
  if (!item) {
    console.warn(`No item with slug "${slug}" in "${collectionName}".`);
    return [];
  }

  // If item.sections is defined (even if empty), use it
  // Else, use collection.metadata.itemsSections
  if (item.sections !== undefined) {
    return item.sections;
  } else {
    return colObj.metadata.itemsSections || [];
  }
}

/**
 * Retrieve homepage sections from config.
 */
export function getHomepageSections() {
  return homepageSections || [];
}
