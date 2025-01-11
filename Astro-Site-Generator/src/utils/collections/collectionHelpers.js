// src/utils/collections/collectionHelpers.js
import { collections } from "../../content/config.ts";

/** Returns an array of available collections dynamically. */
export function getAvailableCollections() {
  return Object.keys(collections);
}

/** Validates if a given collection exists. */
export function isValidCollection(collection) {
  return getAvailableCollections().includes(collection);
}

/** Formats the collection name for display. */
export function formatCollectionName(collection) {
  if (!collection) return "";
  return collection.charAt(0).toUpperCase() + collection.slice(1);
}
