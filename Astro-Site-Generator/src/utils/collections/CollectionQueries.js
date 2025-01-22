// src/utils/collections/CollectionQueries.js

import {
  getAvailableCollections,
  fetchCollectionItems,
  fetchFeaturedItems,
  formatCollectionName,
} from "./index";

import { collections } from "../../content/config"; // so we can read all data

// Existing relational helpers
import {
  getDirectAndReverseRefs,
  extractReferencesToOtherCollections,
  hasAnyReferenceIntersection,
  findMultiHopReferences,
  findSameCollectionReferences,
} from "./RelationalHelpers.js";

// Hierarchical helpers
import {
  findChildren,
  findParents,
  findSiblings,
} from "./HierarchicalHelpers.js";

/**
 * Helper: Normalize an array of “raw” items or partial objects by slug,
 * ensuring each item has the correct `hasPage` property and other normalized fields.
 */
async function normalizeItemsBySlug(colName, itemsOrSlugs) {
  // 1) Fetch all normalized items from that collection
  const allNormalized = await fetchCollectionItems(colName);

  // 2) Build a map from slug -> fully normalized item
  const map = new Map(allNormalized.map((itm) => [itm.slug, itm]));

  // 3) Convert itemsOrSlugs into just an array of slugs
  const slugs = itemsOrSlugs.map((x) => (typeof x === "string" ? x : x.slug));

  // 4) Re-map to final array
  const result = [];
  for (const s of slugs) {
    if (map.has(s)) {
      result.push(map.get(s));
    }
  }
  return result;
}

export function generateCollectionQueries() {
  const queries = [];
  const collectionNames = getAvailableCollections(); // e.g., ["services", "projects", "testimonials", etc.]

  for (const colName of collectionNames) {
    const formattedColName = formatCollectionName(colName);
    const colObj = collections[colName];
    const isHierarchical = !!colObj.metadata.isHierarchical;

    // 1) AllItems<CollectionName>
    queries.push({
      name: `AllItems${formattedColName}`,
      description: `All items from "${colName}" collection`,
      async getItems() {
        // Always fetch normalized items so they have hasPage
        const items = await fetchCollectionItems(colName);
        return items.map((itm) => ({
          ...itm,
          href: `/${colName}/${itm.slug}`,
        }));
      },
    });

    // 2) Featured<CollectionName>
    queries.push({
      name: `Featured${formattedColName}`,
      description: `Featured items from "${colName}" collection`,
      async getItems() {
        // Also fetch normalized, then filter by featured
        const items = await fetchFeaturedItems(colName);
        return items.map((itm) => ({
          ...itm,
          href: `/${colName}/${itm.slug}`,
        }));
      },
    });

    // 3) Related<CollectionName>
    queries.push({
      name: `Related${formattedColName}`,
      description: `Items from "${colName}" that reference or are referenced by the current item (multi-hop + same-collection).`,
      async getItems({ slug, currentCollection }) {
        // A) AGGREGATOR MODE: If we have a currentCollection but no slug
        if (!slug && currentCollection) {
          const currentColObj = collections[currentCollection];
          if (!currentColObj) return [];

          // We'll gather references in a Set for uniqueness
          const aggregatorSet = new Set();

          // For each item in the “currentCollection,” collect references
          for (const item of currentColObj.data) {
            if (colName !== currentCollection) {
              // Cross-collection references
              const multiHopItems = findMultiHopReferences(
                item,
                currentCollection,
                colName
              );
              for (const refItem of multiHopItems) {
                aggregatorSet.add(refItem);
              }
            } else {
              // Same-collection references
              const sameColItems = findSameCollectionReferences(item, colName);
              for (const refItem of sameColItems) {
                aggregatorSet.add(refItem);
              }
            }
          }

          // aggregatorSet is an array of partial objects from collections[colName].data
          // but let's normalize them to ensure each has hasPage
          const aggregatorArr = [...aggregatorSet];
          const normalized = await normalizeItemsBySlug(colName, aggregatorArr);

          // Then map to final output
          return normalized.map((itm) => ({
            ...itm,
            href: `/${colName}/${itm.slug}`,
          }));
        }

        // B) ITEM-LEVEL MODE: If we have a slug + currentCollection
        if (!slug || !currentCollection) return [];
        const currentColObj = collections[currentCollection];
        if (!currentColObj) return [];

        // Find the current item
        const currentItem = currentColObj.data.find((i) => i.slug === slug);
        if (!currentItem) return [];

        // If cross-collection:
        if (colName !== currentCollection) {
          const multiHopItems = findMultiHopReferences(currentItem, currentCollection, colName);
          const unique = [...new Set(multiHopItems)];

          // Normalize
          const normalized = await normalizeItemsBySlug(colName, unique);
          return normalized.map((itm) => ({
            ...itm,
            href: `/${colName}/${itm.slug}`,
          }));
        }

        // SAME-COLLECTION references
        const isTargetHierarchical = !!collections[colName].metadata.isHierarchical;
        if (isTargetHierarchical) {
          // siblings approach
          const itemsInSameCollection = collections[colName].data;
          const siblings = findSiblings(currentItem, itemsInSameCollection);

          const normalized = await normalizeItemsBySlug(colName, siblings);
          return normalized.map((itm) => ({
            ...itm,
            href: `/${colName}/${itm.slug}`,
          }));
        } else {
          // old same-collection references
          const sameColItems = findSameCollectionReferences(currentItem, colName);
          const normalized = await normalizeItemsBySlug(colName, sameColItems);
          return normalized.map((itm) => ({
            ...itm,
            href: `/${colName}/${itm.slug}`,
          }));
        }
      },
    });

    // 4) If isHierarchical, add children/parent/sibling queries
    if (isHierarchical) {
      // Children<CollectionName>
      queries.push({
        name: `Children${formattedColName}`,
        description: `All direct children of the current item in "${colName}".`,
        async getItems({ slug }) {
          if (!slug) return [];
          // fetch normalized
          const items = await fetchCollectionItems(colName);
          const currentItem = items.find((i) => i.slug === slug);
          if (!currentItem) return [];

          const children = findChildren(currentItem, items);
          return children.map((child) => ({
            ...child,
            href: `/${colName}/${child.slug}`,
          }));
        },
      });

      // Parent<CollectionName>
      queries.push({
        name: `Parent${formattedColName}`,
        description: `All parent ancestors of the current item in "${colName}".`,
        async getItems({ slug }) {
          if (!slug) return [];
          // fetch normalized
          const items = await fetchCollectionItems(colName);
          const currentItem = items.find((i) => i.slug === slug);
          if (!currentItem) return [];

          const parents = findParents(currentItem, items);
          return parents.map((p) => ({
            ...p,
            href: `/${colName}/${p.slug}`,
          }));
        },
      });

      // Sibling<CollectionName>
      queries.push({
        name: `Sibling${formattedColName}`,
        description: `All sibling items (same parent) in "${colName}".`,
        async getItems({ slug }) {
          if (!slug) return [];
          // fetch normalized
          const items = await fetchCollectionItems(colName);
          const currentItem = items.find((i) => i.slug === slug);
          if (!currentItem) return [];

          const siblings = findSiblings(currentItem, items);
          return siblings.map((s) => ({
            ...s,
            href: `/${colName}/${s.slug}`,
          }));
        },
      });
    }
  }

  return queries;
}
