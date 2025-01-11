// src/utils/queries/CollectionQueries.js
import {
  getAvailableCollections,
  fetchCollectionItems,
  fetchFeaturedItems,
  formatCollectionName, // Ensure this is imported
} from "../collections/index.js";

/**
 * Dynamically generate query objects for each collection:
 * - "AllItems<CollectionName>"
 * - "Featured<CollectionName>"
 */
export function generateCollectionQueries() {
  const queries = [];
  const collectionNames = getAvailableCollections(); // e.g. ["services","projects",...]

  for (const colName of collectionNames) {
    const formattedColName = formatCollectionName(colName); // e.g., "Services"

    // Query A: "AllItemsServices"
    queries.push({
      name: `AllItems${formattedColName}`, // PascalCase
      description: `All items from "${colName}" collection`,
      async getItems() {
        const items = await fetchCollectionItems(colName);
        // Convert each item to a standard shape, e.g., { label, href }
        return items.map((itm) => ({
          label: itm.title,
          href: `/${colName}/${itm.slug}`,
        }));
      },
    });

    // Query B: "FeaturedServices"
    queries.push({
      name: `Featured${formattedColName}`, // PascalCase
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
