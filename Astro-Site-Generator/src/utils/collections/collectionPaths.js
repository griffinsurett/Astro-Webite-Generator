// src/utils/collections/collectionPaths.js
import { collections } from "../../content/config.ts";
import { getAvailableCollections } from "./collectionHelpers.js";

/**
 * Generates static paths for all collections that have hasPage set to true.
 * @returns {Array<Object>} - An array of path objects.
 */
export async function generateCollectionPaths() {
  const availableCollections = getAvailableCollections();
  const paths = [];

  availableCollections.forEach((col) => {
    const collection = collections[col];
    if (collection.metadata.hasPage) {
      paths.push({ params: { collection: col } });
    }
  });

  return paths;
}

/**
 * Generates static paths for all items in all collections, respecting hasPage and itemsHasPage.
 * @returns {Array<Object>} - An array of path objects.
 */
export async function generateItemPaths() {
  const paths = [];

  for (const [collectionName, collection] of Object.entries(collections)) {
    const { itemsHasPage } = collection.metadata;

    collection.data.forEach((item) => {
      // If item.hasPage is explicitly set, honor that; otherwise use itemsHasPage
      const itemHasPage = item.hasPage !== undefined ? item.hasPage : null;

      if (itemsHasPage) {
        // Collection allows item pages by default
        if (itemHasPage !== false) {
          paths.push({
            params: {
              collection: collectionName,
              slug: item.slug,
            },
          });
        }
      } else {
        // Collection does NOT allow item pages by default
        if (itemHasPage === true) {
          paths.push({
            params: {
              collection: collectionName,
              slug: item.slug,
            },
          });
        }
      }
    });
  }

  return paths;
}
