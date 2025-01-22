// src/utils/redirects/generatePaths.js

import { collections } from "../../content/config";
import { getAvailableCollections, fetchCollectionItems } from "../collections";

export async function generateTwoSegmentPaths() {
  const paths = [];

  for (const colName of getAvailableCollections()) {
    const colObj = collections[colName];
    
    // IMPORTANT: fetch normalized items, so each hasPage is guaranteed set:
    const items = await fetchCollectionItems(colName);

    // 1) Add actual item paths if item.hasPage === true
    for (const item of items) {
      if (item.hasPage) {
        paths.push({ params: { collection: colName, slug: item.slug } });
      }

      // 2) Add item-level redirect slugs
      if (item.redirectFrom && item.redirectFrom.length) {
        for (const rSlug of item.redirectFrom) {
          paths.push({ params: { collection: colName, slug: rSlug } });
        }
      }
    }

    // 3) Add collection-level redirects, ignoring itemsHasPage
    if (colObj.metadata.redirectFrom) {
      for (const rFrom of colObj.metadata.redirectFrom) {
        // If the item has a page, we create the alias route, plus any item redirect slugs
        for (const item of items) {
          if (item.hasPage) {
            paths.push({ params: { collection: rFrom, slug: item.slug } });
          }
          if (item.redirectFrom && item.redirectFrom.length) {
            for (const rSlug of item.redirectFrom) {
              paths.push({ params: { collection: rFrom, slug: rSlug } });
            }
          }
        }
      }
    }
  }

  // Deduplicate
  const uniquePathsSet = new Set(paths.map(p => `${p.params.collection}/${p.params.slug}`));
  const uniquePaths = [...uniquePathsSet].map(path => {
    const [collection, slug] = path.split("/");
    return { params: { collection, slug } };
  });

  console.log(`Generated ${uniquePaths.length} two-segment paths.`);
  return uniquePaths;
}

export async function generateSingleSegmentPaths() {
  const paths = [];

  for (const colName of getAvailableCollections()) {
    const colObj = collections[colName];

    // Again, fetch items so each item has a final hasPage
    const items = await fetchCollectionItems(colName);

    // 1) If item.hasPage, we add /[slug]
    for (const item of items) {
      if (item.hasPage) {
        paths.push({ params: { slug: item.slug } });
      }
      // 2) Add item redirect slugs
      if (item.redirectFrom && item.redirectFrom.length) {
        for (const rSlug of item.redirectFrom) {
          paths.push({ params: { slug: rSlug } });
        }
      }
    }

    // 3) Add collection-level redirect slugs
    if (colObj.metadata.redirectFrom) {
      for (const rFrom of colObj.metadata.redirectFrom) {
        paths.push({ params: { slug: rFrom } });
      }
    }
  }

  // Deduplicate
  const uniqueSlugsSet = new Set(paths.map(p => p.params.slug));
  const uniqueSlugs = [...uniqueSlugsSet].map(slug => ({ params: { slug } }));

  console.log(`Generated ${uniqueSlugs.length} single-segment paths.`);
  return uniqueSlugs;
}
