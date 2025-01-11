// src/utils/queries/CollectionQueries.js
import {
  getAvailableCollections,
  fetchCollectionItems,
  fetchFeaturedItems,
  formatCollectionName,
} from "../collections/index.js";

/**
 * Dynamically generate query objects for each collection:
 * - "AllItems<CollectionName>"
 * - "Featured<CollectionName>"
 */
export function generateCollectionQueries() {
  const queries = [];
  const collectionNames = getAvailableCollections(); // e.g., ["services","projects",...]

  for (const colName of collectionNames) {
    const formattedColName = formatCollectionName(colName); // e.g., "Services"

    // Query A: "AllItemsServices"
    queries.push({
      name: `AllItems${formattedColName}`, // PascalCase
      description: `All items from "${colName}" collection`,
      async getItems() {
        const items = await fetchCollectionItems(colName);
        // Return full item data instead of only label and href
        return items.map((itm) => ({
          ...itm, // Spread all properties
          href: `/${colName}/${itm.slug}`, // Ensure href is included
        }));
      },
    });

    // Query B: "FeaturedServices"
    queries.push({
      name: `Featured${formattedColName}`, // PascalCase
      description: `Featured items from "${colName}" collection`,
      async getItems() {
        const items = await fetchFeaturedItems(colName);
        // Return full item data instead of only label and href
        return items.map((itm) => ({
          ...itm, // Spread all properties
          href: `/${colName}/${itm.slug}`, // Ensure href is included
        }));
      },
    });
  }

  return queries;
}
