// src/utils/queries/CollectionQueries.js
import {
  getAvailableCollections,
  fetchCollectionItems,
  fetchFeaturedItems,
  formatCollectionName,
} from "../../utils/collections/";

import { collections } from "../../content/config.ts"; // so we can read all data

// NEW: import the helpers from relationalHelpers.js
import {
  getDirectAndReverseRefs,
  extractReferencesToOtherCollections,
  hasAnyReferenceIntersection,
} from "./relationalHelpers.js";

export function generateCollectionQueries() {
  const queries = [];
  const collectionNames = getAvailableCollections(); // e.g., ["services", "projects", ...]

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
      description: `Items from "${colName}" that reference or are referenced by the current item (plus same-collection shared references).`,
      async getItems({ slug, currentCollection }) {
        if (!slug || !currentCollection) return [];

        // A) Find the current item in its own collection
        const currentColObj = collections[currentCollection];
        if (!currentColObj) return [];
        const currentItem = currentColObj.data.find((i) => i.slug === slug);
        if (!currentItem) return [];

        // B) If colName !== currentCollection (i.e. we want RelatedServices from a Project page),
        //    then do the standard "direct + reverse" references.
        if (colName !== currentCollection) {
          const { directRefs, reverseRefs } = getDirectAndReverseRefs(currentItem, colName);
          const combined = [...directRefs, ...reverseRefs];
          const unique = Array.from(new Set(combined));
          return unique.map((item) => ({
            ...item,
            href: `/${colName}/${item.slug}`,
          }));
        }

        // C) If colName === currentCollection (i.e. a Project page wanting RelatedProjects),
        //    we gather:
        //    1) "shared references" with other items in the same collection
        //    2) "direct + reverse" references if self-referencing is possible

        const sameCollection = collections[colName].data;
        const sameColResults = [];

        // Gather all references of the current item that point to *other* collections
        const referencesByCollection = extractReferencesToOtherCollections(currentItem);

        for (const otherItem of sameCollection) {
          if (otherItem.slug === slug) continue;
          const otherRefs = extractReferencesToOtherCollections(otherItem);

          if (hasAnyReferenceIntersection(referencesByCollection, otherRefs)) {
            sameColResults.push(otherItem);
          }
        }

        // Also handle "direct + reverse" references within the same collection
        const { directRefs, reverseRefs } = getDirectAndReverseRefs(currentItem, colName);
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
