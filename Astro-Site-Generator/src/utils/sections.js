// src/utils/sections.js
import { collections } from "../content/config";

/**
 * Return the root-level sections from a collection’s metadata.
 * These apply to the collection root page (e.g. /services).
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
 * These apply to an individual item’s detail page (e.g. /services/web-design).
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

  // Return item.sections if defined; otherwise empty array.
  return item.sections || [];
}
