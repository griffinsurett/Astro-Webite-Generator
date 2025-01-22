// src/utils/collections/collectionPaths.js

import { collections } from "../../content/config.ts";
import { getAvailableCollections } from "./collectionHelpers.js";

/** Generate static paths for collections that have hasPage: true. */
export async function generateCollectionPaths() {
  const paths = [];
  for (const colName of getAvailableCollections()) {
    if (collections[colName].metadata.hasPage) {
      paths.push({ params: { collection: colName } });
    }
  }
  return paths;
}

/** 
 * Generate static paths for all items in all collections. 
 * Now we rely only on the item’s hasPage. 
 */
export async function generateItemPaths() {
  const paths = [];
  for (const [colName, collObj] of Object.entries(collections)) {
    // If no data, skip
    if (!collObj.data) continue;

    // We do NOT check collObj.metadata.itemsHasPage here anymore
    // because each item is guaranteed to have a boolean .hasPage
    for (const rawItem of collObj.data) {
      const item = { ...rawItem }; 
      // Optionally, you can re-use fetchCollectionItem() to ensure normalization:
      // const item = await fetchCollectionItem(colName, rawItem.slug);

      // item.hasPage is already set by normalization if not defined
      if (item.hasPage) {
        paths.push({ params: { collection: colName, slug: item.slug } });
      }
    }
  }
  return paths;
}
