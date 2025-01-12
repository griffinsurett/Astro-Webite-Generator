// src/utils/collections/fetchRelationalData.js
import { collections } from "../../content/config.ts";
import { isValidCollection, getAvailableCollections } from "./collectionHelpers.js";

/**
 * For a given collection and slug, fetch:
 * 1) All direct references (items that this slug references).
 * 2) All reverse references (items in other collections that reference this slug).
 *
 * Returns an object like:
 * {
 *   direct: {
 *     services: [ { ...service1}, { ...service2} ],
 *     ...
 *   },
 *   reverse: {
 *     services: [ { ...serviceThatReferencesMe}, ... ],
 *     projects: [ ... ],
 *   }
 * }
 *
 * Usage:
 * const { direct, reverse } = await fetchRelationalData('projects', 'project-alpha');
 */
export async function fetchRelationalData(collectionName, slug) {
  if (!isValidCollection(collectionName)) {
    throw new Error(`Collection "${collectionName}" is not valid.`);
  }
  const colObj = collections[collectionName];
  if (!colObj) {
    throw new Error(`No data found for collection "${collectionName}".`);
  }

  // 1) Find the main item
  const currentItem = colObj.data.find((item) => item.slug === slug);
  if (!currentItem) {
    throw new Error(`Item with slug "${slug}" not found in "${collectionName}".`);
  }

  // 2) Identify any reference fields in this collection’s schema
  //    In your code, for example, `projects` has `services: reference('services').array().optional()`.
  //    If there are more references, you can handle them similarly.
  //    For simplicity, we’ll assume your references are stored in the item as arrays of slugs.
  //    E.g. currentItem.services = ["web-development", "seo-optimization"]
  //    We'll gather them all as "direct" references.
  const directReferences = {};

  // Example approach: Suppose you know the only reference property in `projects` is `services`. 
  // If you want to make it 100% dynamic, you’d read the schema keys. But here's a simpler pattern:
  for (const [key, value] of Object.entries(currentItem)) {
    // is this field an array of references for a different collection?
    // you can check if key === "services" AND the field is an array of strings.
    if (Array.isArray(value) && key !== "slug" && typeof value[0] === "string") {
      // 'services' references the "services" collection
      const referencedCollection = key; // e.g. "services"
      if (!isValidCollection(referencedCollection)) continue; // skip if it’s not a real collection

      // For each referenced slug in `currentItem.services`, fetch the item data
      const itemsData = value.map((refSlug) => {
        const colData = collections[referencedCollection].data;
        return colData.find((itm) => itm.slug === refSlug);
      }).filter(Boolean);

      directReferences[referencedCollection] = itemsData;
    }
  }

  // 3) Reverse references: For all collections, gather items that reference *this slug*.
  //    For example, if we’re on a Service with slug "web-development",
  //    we want to find all Projects that list "web-development" in their "services" array.
  const reverseReferences = {};
  for (const otherColName of getAvailableCollections()) {
    if (!collections[otherColName]?.data) continue;
    // For each item in that other collection, check if they reference `slug`
    const referencingItems = collections[otherColName].data.filter((itm) => {
      // scanning each property that might be an array of references
      // If something includes our current slug in e.g. `itm.services: ['web-development']`
      return Object.values(itm).some((val) => {
        // val might be 'some text', an array, an object, etc.
        if (Array.isArray(val) && val.includes(slug)) {
          return true;
        }
        return false;
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
