// src/utils/queries/CollectionQueries.js
import {
    getAvailableCollections,
    fetchCollectionItems,
    fetchFeaturedItems,
  } from "../../utils/collections/index.js";
  
  /**
   * Dynamically generate query objects for each collection:
   * - "AllItems-<collection>"
   * - "Featured-<collection>"
   */
  export function generateCollectionQueries() {
    const queries = [];
    const collectionNames = getAvailableCollections(); // e.g. ["services","projects",...]
  
    for (const colName of collectionNames) {
      // Query A: "AllItems-xxx"
      queries.push({
        name: `AllItems-${colName}`,
        description: `All items from "${colName}" collection`,
        async getItems() {
          const items = await fetchCollectionItems(colName);
          // Convert each item to a standard shape, e.g. { label, href }
          return items.map((itm) => ({
            label: itm.title,
            href: `/${colName}/${itm.slug}`,
          }));
        },
      });
  
      // Query B: "Featured-xxx"
      queries.push({
        name: `Featured-${colName}`,
        description: `Featured items from "${colName}" collection`,
        async getItems() {
          const items = await fetchFeaturedItems(colName);
          return items.map((itm) => ({
            label: itm.title,
            href: `/${colName}/${itm.slug}`,
          }));
        },
      });
    }
  
    return queries;
  }
  