// src/utils/queries/CollectionQueries.js

import {
  getAvailableCollections,
  fetchCollectionItems,
  fetchFeaturedItems,
  formatCollectionName,
} from "../../utils/collections/";

import { collections } from "../../content/config.ts"; // so we can read all data

export function generateCollectionQueries() {
  const queries = [];
  const collectionNames = getAvailableCollections(); // e.g., ["services", "projects", ...]

  for (const colName of collectionNames) {
    const formattedColName = formatCollectionName(colName); // e.g. "Services", "Projects", etc.

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
      description: `Items from "${colName}" that reference or are referenced by the current item.`,
      /**
       * We accept params: { slug, currentCollection }
       * to figure out direct & reverse references for colName.
       */
      async getItems({ slug, currentCollection }) {
        if (!slug || !currentCollection) return [];

        // A) Find the current item in its own collection
        const currentColObj = collections[currentCollection];
        if (!currentColObj) return [];
        const currentItem = currentColObj.data.find((i) => i.slug === slug);
        if (!currentItem) return [];

        // B) DIRECT references: If the current item has an array named colName (e.g. "services" or "projects"),
        //    gather those references from the target collection.
        //    For example, if colName=="services" and currentItem.services=["web-dev"], gather those.
        let directRefs = [];
        if (Array.isArray(currentItem[colName])) {
          const allTargetItems = collections[colName].data;
          directRefs = currentItem[colName].map((refSlug) =>
            allTargetItems.find((t) => t.slug === refSlug)
          ).filter(Boolean);
        }

        // C) REVERSE references: Find items in the target collection that reference our `slug`.
        //    For instance, if we are generating "RelatedServices", we want to find all services
        //    that have an array property referencing `slug`. 
        //    Example: a service that has .projects=["project-alpha"] if the slug is "project-alpha".
        const allTargetItems = collections[colName].data;
        const reverseRefs = allTargetItems.filter((targetItem) => {
          // Check each property of `targetItem` to see if it's an array and includes `slug`
          return Object.entries(targetItem).some(([key, val]) => {
            return Array.isArray(val) && val.includes(slug);
          });
        });

        // D) Merge & deduplicate
        const combined = [...directRefs, ...reverseRefs];
        const unique = Array.from(new Set(combined));

        // E) Add an `href` property so these items can be linked to /<colName>/<slug>
        return unique.map((item) => ({
          ...item,
          href: `/${colName}/${item.slug}`,
        }));
      },
    });
  }

  return queries;
}