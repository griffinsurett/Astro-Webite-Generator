// src/utils/collections/collectionPageData.js
import { formatCollectionName } from "./collectionHelpers.js";
import { fetchCollectionItems, getValidatedCollectionItem } from "./collectionFetchers.js";

/**
 * For entire collection page.
 */
export async function getCollectionPageData(collection) {
  const items = await fetchCollectionItems(collection);
  const pageTitle = `Our ${formatCollectionName(collection)}`;
  const pageDescription = `Explore our ${formatCollectionName(collection)}...`;
  return { items, pageTitle, pageDescription };
}

/**
 * For single item page.
 */
export async function getCollectionItemPageData(collection, slug) {
  const item = await getValidatedCollectionItem(collection, slug);
  const pageTitle = `${item.title} | ${formatCollectionName(collection)}`;
  return { ...item, pageTitle };
}
