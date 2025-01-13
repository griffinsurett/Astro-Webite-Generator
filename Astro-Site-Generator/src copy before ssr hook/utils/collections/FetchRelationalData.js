// src/utils/collections/fetchRelationalData.js
import { collections } from "../../content/config.ts";
import { isValidCollection, getAvailableCollections } from "./collectionHelpers.js";

/**
 * For a given collection + slug, returns:
 *  {
 *    direct: { services: [...], anotherCollection: [...] },
 *    reverse: { projects: [...], etc. },
 *    currentItem: { ...the found item... }
 *  }
 * Items are *not* flattened so you can display them by sub-collection.
 */
export async function fetchRelationalData(collectionName, slug) {
  if (!isValidCollection(collectionName)) {
    throw new Error(`Collection "${collectionName}" is not valid.`);
  }

  const colObj = collections[collectionName];
  if (!colObj) {
    throw new Error(`No data found for collection "${collectionName}".`);
  }

  // Find the current item
  const currentItem = colObj.data.find((item) => item.slug === slug);
  if (!currentItem) {
    throw new Error(`Item with slug "${slug}" not found in "${collectionName}".`);
  }

  // Gather "direct" references (fields that reference other collections)
  // Example: if currentItem.services = ["web-development", "seo-optimization"], that references the "services" collection.
  const directReferences = {};
  for (const [key, value] of Object.entries(currentItem)) {
    if (Array.isArray(value) && typeof value[0] === "string") {
      // key might be "services" or "teamMembers" etc.
      if (isValidCollection(key)) {
        // fetch items from that other collection
        const itemsData = value
          .map((refSlug) => collections[key].data.find((itm) => itm.slug === refSlug))
          .filter(Boolean);
        directReferences[key] = itemsData;
      }
    }
  }

  // Gather "reverse" references (which items in other collections reference this slug?)
  const reverseReferences = {};
  for (const otherColName of getAvailableCollections()) {
    if (!collections[otherColName]?.data) continue;

    const referencingItems = collections[otherColName].data.filter((itm) => {
      // For each property in that item, if it's an array of strings and includes `slug`, it's referencing us.
      return Object.values(itm).some((val) => {
        return Array.isArray(val) && val.includes(slug);
      });
    });

    if (referencingItems.length > 0) {
      reverseReferences[otherColName] = referencingItems;
    }
  }

  return {
    direct: directReferences,
    reverse: reverseReferences,
    currentItem,
  };
}
