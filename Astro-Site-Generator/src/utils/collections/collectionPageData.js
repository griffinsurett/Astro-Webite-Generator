// src/utils/collections/collectionPageData.js
import { collections } from "../../content/config.ts"; // so we can access metadata
import { formatCollectionName } from "./collectionHelpers.js";
import { fetchCollectionItems, getValidatedCollectionItem } from "./collectionFetchers.js";

/**
 * For entire collection page, pulling from the collection's own metadata.
 */
export async function getCollectionPageData(collection) {
  // 1) Validate & fetch items from the collection
  const items = await fetchCollectionItems(collection);

  // 2) Grab this collection's metadata from config
  const metadata = collections[collection]?.metadata || {};

  // 3) The final pageTitle and pageDescription can come directly from that metadata
  const pageTitle = metadata.title || formatCollectionName(collection);
  const pageSubtitle = metadata.subtitle || "";
  const pageDescription = metadata.description || "";

  // 4) Return items, metadata, and relevant page data
  return {
    items,
    pageTitle,       // e.g., "Services"
    pageSubtitle,    // e.g., "Our offerings to help your business grow"
    pageDescription, // e.g., "A collection of services provided by the company..."
    hasPage: metadata.hasPage, // Include the hasPage property
  };
}

/**
 * For single item page, also pulling from item data and reusing collection metadata if needed.
 */
export async function getCollectionItemPageData(collection, slug) {
  // 1) Validate & fetch single item
  const item = await getValidatedCollectionItem(collection, slug);

  // 2) For the <title> tag, let's do: "[Item Title] | [Collection Title]"
  const metadata = collections[collection]?.metadata || {};
  const collectionTitle = metadata.title || formatCollectionName(collection);

  // 3) Compose final pageTitle from item + collection
  const pageTitle = `${item.title} | ${collectionTitle}`;

  return {
    ...item,  // includes title, description, icon, featuredImage, etc.
    pageTitle,
  };
}
