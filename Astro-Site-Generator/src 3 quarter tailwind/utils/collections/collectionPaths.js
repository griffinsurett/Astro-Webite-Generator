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

/** Generate static paths for all items in all collections, respecting itemsHasPage & item.hasPage. */
export async function generateItemPaths() {
  const paths = [];
  for (const [colName, collObj] of Object.entries(collections)) {
    if (!collObj.data) continue;

    for (const item of collObj.data) {
      const itemHasPage = item.hasPage ?? null;
      if (collObj.metadata.itemsHasPage) {
        // Collection allows item pages by default
        if (itemHasPage !== false) {
          paths.push({ params: { collection: colName, slug: item.slug } });
        }
      } else {
        // Collection does NOT allow item pages by default
        if (itemHasPage === true) {
          paths.push({ params: { collection: colName, slug: item.slug } });
        }
      }
    }
  }
  return paths;
}
