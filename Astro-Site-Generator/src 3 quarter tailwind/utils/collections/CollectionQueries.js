// src/utils/queries/CollectionQueries.js

import {
  getAvailableCollections,
  fetchCollectionItems,
  fetchFeaturedItems,
  formatCollectionName,
} from "./index";

import { collections } from "../../content/config.js"; // so we can read all data

// Existing relational helpers for multi-hop, etc.
import {
  getDirectAndReverseRefs,
  extractReferencesToOtherCollections,
  hasAnyReferenceIntersection,
  findMultiHopReferences,
  findSameCollectionReferences,
} from "./RelationalHelpers.js";

// ✨ NEW IMPORT
import {
  findChildren,
  findParents,
  findSiblings,
} from "./HierarchicalHelpers.js";

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
        const items = await fetchFeaturedItems(colName);
        return items.map((itm) => ({
          ...itm,
          href: `/${colName}/${itm.slug}`,
        }));
      },
    });

    // Inside generateCollectionQueries()
    queries.push({
      name: `Related${formattedColName}`,
      description: `Items from "${colName}" that reference or are referenced by the current item (multi-hop + same-collection).`,
      async getItems({ slug, currentCollection }) {
        // 1) AGGREGATOR MODE: No slug, but we have currentCollection
        if (!slug && currentCollection) {
          // This is the old aggregator logic for /[collection] index pages
          const currentColObj = collections[currentCollection];
          if (!currentColObj) return [];

          // Grab all items from the currentCollection
          const allItemsInCurrent = currentColObj.data;
          // We'll gather references in a Set for uniqueness
          const aggregatorSet = new Set();

          for (const item of allItemsInCurrent) {
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

          // Convert to array, map in an href, return
          return [...aggregatorSet].map((item) => ({
            ...item,
            href: `/${colName}/${item.slug}`,
          }));
        }

        // 2) ITEM-LEVEL MODE: We have a slug and a currentCollection
        if (!slug || !currentCollection) return [];
        const currentColObj = collections[currentCollection];
        if (!currentColObj) return [];

        // Find the current item
        const currentItem = currentColObj.data.find((i) => i.slug === slug);
        if (!currentItem) return [];

        // Cross-collection references (unchanged)
        if (colName !== currentCollection) {
          const multiHopItems = findMultiHopReferences(
            currentItem,
            currentCollection,
            colName
          );
          const unique = Array.from(new Set(multiHopItems));
          return unique.map((item) => ({
            ...item,
            href: `/${colName}/${item.slug}`,
          }));
        }

        // SAME-COLLECTION REFERENCES
        // Check if the target collection is hierarchical
        const isTargetHierarchical =
          !!collections[colName].metadata.isHierarchical;
        if (isTargetHierarchical) {
          // If hierarchical → Return siblings
          const itemsInSameCollection = collections[colName].data;
          const siblings = findSiblings(currentItem, itemsInSameCollection);
          return siblings.map((sibling) => ({
            ...sibling,
            href: `/${colName}/${sibling.slug}`,
          }));
        } else {
          // Otherwise (non-hierarchical) → Use the old same-collection references
          const sameColItems = findSameCollectionReferences(
            currentItem,
            colName
          );
          return sameColItems.map((item) => ({
            ...item,
            href: `/${colName}/${item.slug}`,
          }));
        }
      },
    });

    /* -----------------------------------------------
       NEW: Add hierarchy-specific queries if “isHierarchical” is true
    ----------------------------------------------- */
    if (isHierarchical) {
      // Children<CollectionName>
      queries.push({
        name: `Children${formattedColName}`,
        description: `All direct children of the current item in "${colName}".`,
        async getItems({ slug }) {
          if (!slug) return [];
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
          const items = await fetchCollectionItems(colName);
          const currentItem = items.find((i) => i.slug === slug);
          if (!currentItem) return [];

          const parents = findParents(currentItem, items);
          // Usually you'd want to reverse() here if you prefer top-down order
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
