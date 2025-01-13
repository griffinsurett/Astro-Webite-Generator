// src/utils/redirects/handleRedirects.js
import { collections } from "../../content/config";
import { getAvailableCollections } from "../collections";

/**
 * Finds if a slug is a collection-level redirect.
 * @param {string} slug
 * @returns {string|null} - Returns the collection name if found, else null.
 */
function findCollectionRedirect(slug) {
  for (const colName of getAvailableCollections()) {
    const collection = collections[colName];
    if (
      collection.metadata.redirectFrom &&
      collection.metadata.redirectFrom.includes(slug)
    ) {
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
function findItemRedirect(collection, slug) {
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

/**
 * Finds if a collection slug is an alias and returns the actual collection name.
 * @param {string} collectionSlug
 * @returns {string|null} - Returns the actual collection name if alias found, else null.
 */
function findCollectionRedirectAlias(collectionSlug) {
  for (const colName of getAvailableCollections()) {
    const colObj = collections[colName];
    if (
      colObj.metadata.redirectFrom &&
      colObj.metadata.redirectFrom.includes(collectionSlug)
    ) {
      return colName; // Return the actual collection name
    }
  }
  return null;
}

/**
 * Determines if the current two-segment route requires a redirect.
 * @param {string} collection - Collection name from the route.
 * @param {string} slug - Slug from the route.
 * @returns {string|null} - Target URL if redirect is needed, else null.
 */
export function handleTwoSegmentRedirect(collection, slug) {
  let targetCollection = collection;
  let targetSlug = slug;

  // Step 1: Check if the collection is an alias and redirect if necessary
  const actualCollection = findCollectionRedirectAlias(targetCollection);
  if (actualCollection) {
    console.log(`Redirecting collection alias: /${targetCollection} → /${actualCollection}`);
    targetCollection = actualCollection;
  }

  // Step 2: Check if the slug is an item-level redirect in the (possibly updated) collection
  const itemRedirect = findItemRedirect(targetCollection, targetSlug);
  if (itemRedirect) {
    console.log(`Redirecting slug: /${targetCollection}/${targetSlug} → /${itemRedirect.collection}/${itemRedirect.targetSlug}`);
    targetCollection = itemRedirect.collection;
    targetSlug = itemRedirect.targetSlug;
  }

  // Step 3: Check if the final target exists
  const collectionItems = collections[targetCollection]?.data || [];
  const itemExists = collectionItems.some((item) => item.slug === targetSlug);
  if (!itemExists) {
    console.warn(`Item not found: /${targetCollection}/${targetSlug} → Redirecting to /404`);
    return `/404`;
  }

  // Step 4: Determine if any redirect occurred
  if (targetCollection !== collection || targetSlug !== slug) {
    console.log(`Final Redirect: /${targetCollection}/${targetSlug}`);
    return `/${targetCollection}/${targetSlug}`;
  }

  // No redirect needed
  return null;
}

/**
 * Determines if the current single-segment route requires a redirect.
 * @param {string} slug - Slug from the route.
 * @returns {string|null} - Target URL if redirect is needed, else null.
 */
export function handleSingleSegmentRedirect(slug) {
  // Check if the slug is a collection-level redirect
  const collectionRedirect = findCollectionRedirect(slug);
  if (collectionRedirect) {
    console.log(`Redirecting collection slug: /${slug} → /${collectionRedirect}`);
    return `/${collectionRedirect}`;
  }

  // Check if the slug is an item-level redirect
  const itemRedirect = findItemRedirect(null, slug);
  if (itemRedirect) {
    console.log(`Redirecting item slug: /${slug} → /${itemRedirect.collection}/${itemRedirect.targetSlug}`);
    return `/${itemRedirect.collection}/${itemRedirect.targetSlug}`;
  }

  // Check if the slug exists as an item in any collection
  for (const colName of getAvailableCollections()) {
    const foundItem = collections[colName].data.find(
      (item) => item.slug === slug
    );
    if (foundItem) {
      console.log(`Direct match found: /${colName}/${slug}`);
      return `/${colName}/${slug}`;
    }
  }

  // No redirect found, send to 404
  console.warn(`No redirect found for /${slug}. Redirecting to /404`);
  return `/404`;
}