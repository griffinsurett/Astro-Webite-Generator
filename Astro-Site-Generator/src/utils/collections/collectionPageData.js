// src/utils/collections/collectionPageData.js
import { formatCollectionName } from "./collectionHelpers.js";
import { fetchCollectionItems, getValidatedCollectionItem } from "./collectionFetchers.js";

/**
 * Fetches and formats all necessary data for a collection page.
 * @param {string} collection - The name of the collection.
 * @returns {Object} - An object containing items, pageTitle, and pageDescription.
 */
export async function getCollectionPageData(collection) {
  const items = await fetchCollectionItems(collection);
  const formattedCollectionName = formatCollectionName(collection);
  const pageTitle = `Our ${formattedCollectionName}`;
  const pageDescription = `Explore our ${formattedCollectionName} and discover what we offer.`;

  return { items, pageTitle, pageDescription };
}

/**
 * Fetches and formats data for a collection item page.
 * @param {string} collection - The name of the collection.
 * @param {string} slug - The slug of the item.
 * @returns {Object} - An object containing the item data plus a custom pageTitle.
 */
export async function getCollectionItemPageData(collection, slug) {
  const item = await getValidatedCollectionItem(collection, slug);
  const pageTitle = `${item.title} | ${formatCollectionName(collection)}`;
  return { ...item, pageTitle };
}
