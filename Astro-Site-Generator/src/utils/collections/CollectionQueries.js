// src/utils/queries/CollectionQueries.js

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
  // ✨ NEW: aggregator import
  aggregateCollectionLevelReferences,
} from "./RelationalHelpers.js";

import {
  findChildren,
  findParents,
  findSiblings,
} from "./HierarchicalHelpers.js";

export function generateCollectionQueries() {
  const queries = [];
  const collectionNames = getAvailableCollections(); // e.g. ["services", "projects", "testimonials", etc.]

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

    // 3) Related<CollectionName>
    queries.push({
      name: `Related${formattedColName}`,
      description: `Items from "${colName}" that reference or are referenced by the current item (multi-hop + same-collection).`,
      async getItems({ slug, currentCollection }) {
        // 1) If we do NOT have a slug → aggregator mode
        if (!slug && currentCollection) {
          // Move aggregator logic to the new helper function:
          const aggregatedItems = aggregateCollectionLevelReferences(
            currentCollection,
            colName
          );
          return aggregatedItems.map((item) => ({
            ...item,
            href: `/${colName}/${item.slug}`,
          }));
        }

        // 2) If we DO have a slug → item-level mode (existing logic)
        if (!slug || !currentCollection) return [];
        const currentColObj = collections[currentCollection];
        if (!currentColObj) return [];

        // find the current item
        const currentItem = currentColObj.data.find((i) => i.slug === slug);
        if (!currentItem) return [];

        // If target collection != current, gather direct/reverse + multi-hop
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

        // Otherwise, gather same-collection references
        const sameColItems = findSameCollectionReferences(currentItem, colName);
        return sameColItems.map((item) => ({
          ...item,
          href: `/${colName}/${item.slug}`,
        }));
      },
    });

    /* -----------------------------------------------
       Hierarchy queries (unchanged)
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
          // Usually you'd want to reverse() if you prefer top-down
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
