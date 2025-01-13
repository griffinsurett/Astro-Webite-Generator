// src/utils/redirects.js
import { collections } from "../../content/config";
import { getAvailableCollections } from "../collections";

// ---------------------
// Path Generation Functions
// ---------------------

/**
 * Generates all static paths for two-segment routes, including redirects.
 * @returns {Array<{ params: { collection: string, slug: string } }>}
 */
export async function generateTwoSegmentPaths() {
  const paths = [];

  for (const colName of getAvailableCollections()) {
    const items = collections[colName].data;

    // Add actual item paths and their slug-level redirects
    for (const item of items) {
      // Actual item path: /services/seo-optimization
      paths.push({ params: { collection: colName, slug: item.slug } });

      // Slug-level redirects: /services/seo → /services/seo-optimization
      if (item.redirectFrom && item.redirectFrom.length) {
        for (const rSlug of item.redirectFrom) {
          paths.push({ params: { collection: colName, slug: rSlug } });
        }
      }
    }

    // Add collection-level redirects and their associated slug-level redirects
    if (collections[colName].metadata.redirectFrom) {
      for (const rFrom of collections[colName].metadata.redirectFrom) {
        for (const item of items) {
          // Always add the actual slug for collection-level redirects
          paths.push({ params: { collection: rFrom, slug: item.slug } });

          // Additionally, add the redirect slugs if they exist
          if (item.redirectFrom && item.redirectFrom.length) {
            for (const rSlug of item.redirectFrom) {
              // Combined redirect: /service/seo → /services/seo-optimization
              paths.push({ params: { collection: rFrom, slug: rSlug } });
            }
          }
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
 * Generates all static paths for single-segment routes, including redirects.
 * @returns {Array<{ params: { slug: string } }>}
 */
export async function generateSingleSegmentPaths() {
  const paths = [];

  for (const colName of getAvailableCollections()) {
    const items = collections[colName].data;

    // Add actual item slugs and their redirects
    for (const item of items) {
      paths.push({ params: { slug: item.slug } });

      if (item.redirectFrom && item.redirectFrom.length) {
        for (const rSlug of item.redirectFrom) {
          paths.push({ params: { slug: rSlug } });
        }
      }
    }

    // Add collection-level redirects
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

// ---------------------
// Redirect Handling Functions
// ---------------------

/**
 * Determines if the current two-segment route requires a redirect.
 * @param {string} collection - Collection name from the route.
 * @param {string} slug - Slug from the route.
 * @returns {string|null} - Target URL if redirect is needed, else null.
 */
export function handleTwoSegmentRedirect(collection, slug) {
  // Check if the collection is an alias
  const actualCollection = findCollectionRedirectAlias(collection);
  if (actualCollection) {
    return `/${actualCollection}/${slug}`;
  }

  // Check if the slug is an item-level redirect
  const itemRedirect = findItemRedirect(collection, slug);
  if (itemRedirect) {
    return `/${itemRedirect.collection}/${itemRedirect.targetSlug}`;
  }

  // Check if the slug exists in the collection
  const collectionItems = collections[collection]?.data || [];
  const itemExists = collectionItems.some((item) => item.slug === slug);
  if (!itemExists) {
    return `/404`;
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
    return `/${collectionRedirect}`;
  }

  // Check if the slug is an item-level redirect
  const itemRedirect = findItemRedirect(null, slug);
  if (itemRedirect) {
    return `/${itemRedirect.collection}/${itemRedirect.targetSlug}`;
  }

  // Check if the slug exists as an item in any collection
  for (const colName of getAvailableCollections()) {
    const foundItem = collections[colName].data.find(
      (item) => item.slug === slug
    );
    if (foundItem) {
      return `/${colName}/${slug}`;
    }
  }

  // No redirect found, send to 404
  return `/404`;
}

// ---------------------
// Helper Functions
// ---------------------

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