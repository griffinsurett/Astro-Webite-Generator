// src/utils/queries/CollectionQueries.js
import {
  getAvailableCollections,
  fetchCollectionItems,
  fetchFeaturedItems,
  formatCollectionName,
} from "../collections/index.js";

import { collections } from "../../content/config.ts"; // so we can read all data

import {
  getDirectAndReverseRefs,
  extractReferencesToOtherCollections,
  hasAnyReferenceIntersection,
  findMultiHopReferences,
  findSameCollectionReferences,
} from "./relationalHelpers.js";

export function generateCollectionQueries() {
  const queries = [];
  const collectionNames = getAvailableCollections(); // e.g., ["services", "projects", "testimonials", etc.]

  for (const colName of collectionNames) {
    const formattedColName = formatCollectionName(colName);

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
        if (!slug || !currentCollection) return [];

        // A) Find the current item in its own collection
        const currentColObj = collections[currentCollection];
        if (!currentColObj) return [];
        const currentItem = currentColObj.data.find((i) => i.slug === slug);
        if (!currentItem) return [];

        // B) If colName != currentCollection, gather direct/reverse + multi-hop
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

        // C) If colName == currentCollection, gather same-collection references
        const sameColItems = findSameCollectionReferences(currentItem, colName);
        return sameColItems.map((item) => ({
          ...item,
          href: `/${colName}/${item.slug}`,
        }));
      },
    });
  }

  return queries;
}
