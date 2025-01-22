// src/utils/redirects/generatePaths.js
import { getAvailableCollections, fetchCollectionItems } from "../collections";
import { collections } from "../../content/config";

export async function generateTwoSegmentPaths() {
  const paths = [];

  for (const colName of getAvailableCollections()) {
    const colObj = collections[colName];
    if (!colObj) continue;

    const { metadata } = colObj;
    const { collectionSlugInItem } = metadata;

    // Get all normalized items
    const items = await fetchCollectionItems(colName);

    // 1) If collectionSlugInItem === true => real routes live at /collection/slug
    //    so we generate the normal path if item.hasPage.
    //    If item has item.redirectFrom, those also become two-segment aliases.
    // 2) If collectionSlugInItem === false => /collection/slug is an alias that must redirect
    //    to /slug. We still generate them, so Astro knows about them at build time.

    for (const item of items) {
      // For each item that can have a page:
      if (item.hasPage) {
        paths.push({
          params: {
            collection: colName,
            slug: item.slug,
          },
        });
      }

      // Also handle item-level `redirectFrom` for two-segment paths
      // if it’s relevant to this route style. We generally include them so
      // /collection/old-slug => /collection/new-slug or maybe /slug if false
      if (item.redirectFrom && item.redirectFrom.length) {
        for (const rSlug of item.redirectFrom) {
          paths.push({
            params: {
              collection: colName,
              slug: rSlug,
            },
          });
        }
      }
    }

    // 3) Add collection-level `redirectFrom` for two-segment paths
    //    (this is less common, but we keep the same logic).
    if (metadata.redirectFrom) {
      for (const rFrom of metadata.redirectFrom) {
        // For each item that can have a page:
        for (const item of items) {
          if (item.hasPage) {
            paths.push({
              params: {
                collection: rFrom,
                slug: item.slug,
              },
            });
          }
          if (item.redirectFrom) {
            for (const rSlug of item.redirectFrom) {
              paths.push({
                params: {
                  collection: rFrom,
                  slug: rSlug,
                },
              });
            }
          }
        }
      }
    }
  }

  // Deduplicate
  const uniquePaths = Array.from(
    new Set(paths.map((p) => `${p.params.collection}/${p.params.slug}`))
  ).map((path) => {
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
    if (!colObj) continue;

    const { metadata } = colObj;
    const { collectionSlugInItem } = metadata;

    // fetch normalized items
    const items = await fetchCollectionItems(colName);

    for (const item of items) {
      // If this collection’s items are set to appear at /slug,
      // then we generate official single-segment routes if item.hasPage.
      // Otherwise, if they appear at /collection/slug, any single-segment path
      // might be a redirect alias (depending on your design).
      if (item.hasPage) {
        paths.push({ params: { slug: item.slug } });
      }

      // item-level redirectFrom
      if (item.redirectFrom && item.redirectFrom.length) {
        for (const rSlug of item.redirectFrom) {
          paths.push({ params: { slug: rSlug } });
        }
      }
    }

    // Also handle collection-level redirectFrom => /slug
    if (metadata.redirectFrom) {
      for (const rFrom of metadata.redirectFrom) {
        paths.push({ params: { slug: rFrom } });
      }
    }
  }

  // Deduplicate
  const uniqueSlugs = Array.from(new Set(paths.map((p) => p.params.slug))).map(
    (slug) => ({ params: { slug } })
  );

  console.log(`Generated ${uniqueSlugs.length} single-segment paths.`);
  return uniqueSlugs;
}
