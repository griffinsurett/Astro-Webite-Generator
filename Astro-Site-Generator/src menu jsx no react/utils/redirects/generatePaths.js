// src/utils/redirects/generatePaths.js
import { collections } from "../../content/config";
import { getAvailableCollections } from "../collections";

/**
 * Generates all static paths for two-segment routes, including redirects.
 * Handles both collection-level and slug-level redirects.
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