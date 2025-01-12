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
      description: `Items from "${colName}" that reference or are referenced by the current item (plus multi-hop references, and same-collection shared references).`,
      async getItems({ slug, currentCollection }) {
        if (!slug || !currentCollection) return [];

        // A) Find the current item in its own collection
        const currentColObj = collections[currentCollection];
        if (!currentColObj) return [];
        const currentItem = currentColObj.data.find((i) => i.slug === slug);
        if (!currentItem) return [];

        /**
         * B) If colName !== currentCollection:
         *    1) Standard direct + reverse references between this item and that collection
         *    2) Multi-hop references:
         *       - e.g., from Services => Projects => Testimonials
         */
        if (colName !== currentCollection) {
          // --- 1) Direct + reverse references
          let { directRefs, reverseRefs } = getDirectAndReverseRefs(
            currentItem,
            colName
          );
          let combined = [...directRefs, ...reverseRefs];

          // --- 2) Multi-hop references
          // For each other collection, gather bridging items.
          // Then from those bridging items, gather references to colName
          const multiHopResults = [];
          for (const possibleCol of getAvailableCollections()) {
            // Skip if it's the current collection or the target collection
            if (possibleCol === colName || possibleCol === currentCollection)
              continue;

            // Gather direct+reverse from currentItem => possibleCol
            const { directRefs: directBridge, reverseRefs: reverseBridge } =
              getDirectAndReverseRefs(currentItem, possibleCol);

            // For each bridging item, gather direct+reverse references to colName
            const bridgeItems = [...directBridge, ...reverseBridge];
            for (const bItem of bridgeItems) {
              const { directRefs: dr2, reverseRefs: rr2 } =
                getDirectAndReverseRefs(bItem, colName);
              multiHopResults.push(...dr2, ...rr2);
            }
          }

          combined = [...combined, ...multiHopResults];

          // De-duplicate results
          const unique = Array.from(new Set(combined));
          return unique.map((item) => ({
            ...item,
            href: `/${colName}/${item.slug}`,
          }));
        }

        /**
         * C) If colName === currentCollection (same-collection case):
         *    We gather:
         *      1) "shared references" with other items in the same collection
         *      2) direct + reverse references (if self-referencing is possible)
         */
        const sameCollection = collections[colName].data;
        const sameColResults = [];

        // Gather all references of the current item that point to *other* collections
        const referencesByCollection =
          extractReferencesToOtherCollections(currentItem);

        for (const otherItem of sameCollection) {
          if (otherItem.slug === slug) continue;
          const otherRefs = extractReferencesToOtherCollections(otherItem);

          if (hasAnyReferenceIntersection(referencesByCollection, otherRefs)) {
            sameColResults.push(otherItem);
          }
        }

        const { directRefs, reverseRefs } = getDirectAndReverseRefs(
          currentItem,
          colName
        );
        const combined = [...sameColResults, ...directRefs, ...reverseRefs];
        const unique = Array.from(new Set(combined));

        return unique.map((item) => ({
          ...item,
          href: `/${colName}/${item.slug}`,
        }));
      },
    });
  }

  return queries;
}
