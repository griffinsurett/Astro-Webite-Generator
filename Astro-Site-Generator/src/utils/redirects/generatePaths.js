// src/utils/redirects/generatePaths.js

import { collections } from "../../content/config";
import { getAvailableCollections } from "../collections";

/**
 * Generates all static paths for two-segment routes, including redirects.
 * Considers `hasPage` and `itemsHasPage` flags.
 * Handles both collection-level and slug-level redirects.
 * @returns {Array<{ params: { collection: string, slug: string } }>}
 */
export async function generateTwoSegmentPaths() {
  const paths = [];

  for (const colName of getAvailableCollections()) {
    const collection = collections[colName];
    const items = collection.data;

    // Determine if items should have pages by default
    const itemsHavePages = collection.metadata.itemsHasPage;

    // Add actual item paths based on `itemsHasPage` and individual `item.hasPage`
    for (const item of items) {
      const itemHasPage = item.hasPage ?? itemsHavePages;

      if (itemHasPage) {
        paths.push({ params: { collection: colName, slug: item.slug } });
      }

      // Add slug-level redirects regardless of `hasPage`
      if (item.redirectFrom && item.redirectFrom.length) {
        for (const rSlug of item.redirectFrom) {
          paths.push({ params: { collection: colName, slug: rSlug } });
        }
      }
    }

    // Add collection-level redirects regardless of `hasPage`
    if (collection.metadata.redirectFrom) {
      for (const rFrom of collection.metadata.redirectFrom) {
        for (const item of items) {
          const itemHasPage = item.hasPage ?? itemsHavePages;

          if (itemHasPage) {
            // Add paths like /service/web-development
            paths.push({ params: { collection: rFrom, slug: item.slug } });
          }

          // Add slug-level redirects under the collection alias regardless of `hasPage`
          if (item.redirectFrom && item.redirectFrom.length) {
            for (const rSlug of item.redirectFrom) {
              paths.push({ params: { collection: rFrom, slug: rSlug } });
            }
          }
        }
      }
    }
  }

  // Deduplicate paths to prevent duplicates
  const uniquePathsSet = new Set(paths.map((p) => `${p.params.collection}/${p.params.slug}`));
  const uniquePaths = Array.from(uniquePathsSet).map((path) => {
    const [collection, slug] = path.split("/");
    return { params: { collection, slug } };
  });

  console.log(`Generated ${uniquePaths.length} two-segment paths.`);
  return uniquePaths;
}

/**
 * Generates all static paths for single-segment routes, including redirects.
 * Considers `hasPage` flags where applicable.
 * @returns {Array<{ params: { slug: string } }>}
 */
export async function generateSingleSegmentPaths() {
  const paths = [];

  for (const colName of getAvailableCollections()) {
    const collection = collections[colName];
    const items = collection.data;

    // Determine if items should have pages by default
    const itemsHavePages = collection.metadata.itemsHasPage;

    // Add actual item slugs based on `itemsHasPage` and individual `item.hasPage`
    for (const item of items) {
      const itemHasPage = item.hasPage ?? itemsHavePages;

      if (itemHasPage) {
        paths.push({ params: { slug: item.slug } });
      }

      // Add slug-level redirects regardless of `hasPage`
      if (item.redirectFrom && item.redirectFrom.length) {
        for (const rSlug of item.redirectFrom) {
          paths.push({ params: { slug: rSlug } });
        }
      }
    }

    // Add collection-level redirects regardless of `hasPage`
    if (collection.metadata.redirectFrom) {
      for (const rFrom of collection.metadata.redirectFrom) {
        paths.push({ params: { slug: rFrom } });
      }
    }
  }

  // Deduplicate slugs
  const uniqueSlugsSet = new Set(paths.map((p) => p.params.slug));
  const uniqueSlugs = Array.from(uniqueSlugsSet).map((slug) => ({ params: { slug } }));

  console.log(`Generated ${uniqueSlugs.length} single-segment paths.`);
  return uniqueSlugs;
}
