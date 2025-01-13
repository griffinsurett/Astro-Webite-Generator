// src/utils/redirects.js
import { collections } from "../content/config";
import { getAvailableCollections } from "./collections";

/**
 * Finds if a slug is a collection-level redirect.
 * @param {string} slug
 * @returns {string|null} - Returns the collection name if found, else null.
 */
export function findCollectionRedirect(slug) {
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

/**
 * Finds if a collection slug is an alias and returns the actual collection name.
 * @param {string} collectionSlug
 * @returns {string|null} - Returns the actual collection name if alias found, else null.
 */
export function findCollectionRedirectAlias(collectionSlug) {
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
 * Generates all redirect paths for two-segment routes.
 * @returns {Array<{ params: { collection: string, slug: string } }>}
 */
export async function generateRedirectItemPaths() {
  const paths = [];

  for (const colName of getAvailableCollections()) {
    const items = collections[colName].data;

    // Add item-level redirectFrom slugs
    for (const itm of items) {
      if (itm.redirectFrom && itm.redirectFrom.length) {
        for (const rSlug of itm.redirectFrom) {
          paths.push({ params: { collection: colName, slug: rSlug } });
        }
      }
    }

    // Add collection-level redirectFrom slugs
    if (collections[colName].metadata.redirectFrom) {
      for (const rFrom of collections[colName].metadata.redirectFrom) {
        const slugs = collections[colName].data.map((item) => item.slug);
        for (const slug of slugs) {
          paths.push({ params: { collection: rFrom, slug } });
        }
      }
    }
  }

  // Deduplicate paths
  const uniquePaths = Array.from(
    new Set(paths.map((p) => `${p.params.collection}/${p.params.slug}`))
  ).map((path) => {
    const [collection, slug] = path.split("/");
    return { params: { collection, slug } };
  });

  return uniquePaths;
}

/**
 * Generates all redirect paths for single-segment routes.
 * @returns {Array<{ params: { slug: string } }>}
 */
export async function generateSingleRedirectPaths() {
  const paths = [];

  for (const colName of getAvailableCollections()) {
    const items = collections[colName].data;

    // Add item slugs and their redirectFrom slugs
    for (const item of items) {
      paths.push({ params: { slug: item.slug } });
      if (item.redirectFrom && item.redirectFrom.length) {
        for (const rSlug of item.redirectFrom) {
          paths.push({ params: { slug: rSlug } });
        }
      }
    }

    // Add collection-level redirectFrom slugs
    if (collections[colName].metadata.redirectFrom) {
      for (const rFrom of collections[colName].metadata.redirectFrom) {
        paths.push({ params: { slug: rFrom } });
      }
    }
  }

  // Deduplicate slugs
  const uniqueSlugs = Array.from(new Set(paths.map((p) => p.params.slug)));
  return uniqueSlugs.map((slug) => ({ params: { slug } }));
}
