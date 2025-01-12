// src/utils/queries/relationalHelpers.js
import { collections } from "../../content/config.ts";

/**
 * getDirectAndReverseRefs(item, colName):
 * - item: the current item object
 * - colName: "services" or "projects" or etc.
 * Returns: { directRefs: [...], reverseRefs: [...] }
 * 
 * This is the same logic you had before for "direct references" and "reverse references."
 */
export function getDirectAndReverseRefs(item, colName) {
  let directRefs = [];
  const allTargetItems = collections[colName].data;

  // directRefs: if item[colName] is an array of slugs referencing that collection
  if (Array.isArray(item[colName])) {
    directRefs = item[colName]
      .map((refSlug) => allTargetItems.find((t) => t.slug === refSlug))
      .filter(Boolean);
  }

  // reverseRefs: any item in colName referencing this `item.slug`
  const reverseRefs = allTargetItems.filter((targetItem) => {
    // Check each property. If it's an array and includes the current slug, it's referencing us
    return Object.entries(targetItem).some(([key, val]) => {
      return Array.isArray(val) && val.includes(item.slug);
    });
  });

  return { directRefs, reverseRefs };
}

/**
 * extractReferencesToOtherCollections(item):
 * Returns an object where each key is a different collection name,
 * and the value is a Set of slugs from that collection that this item references.
 * 
 * Example: if item.services = ["web-development"], and item.team = ["bob", "alice"],
 * and "services" + "team" are valid collections, we'd return:
 * {
 *   services: Set(["web-development"]),
 *   team: Set(["bob","alice"])
 * }
 */
export function extractReferencesToOtherCollections(item) {
  const result = {};
  for (const [fieldKey, fieldVal] of Object.entries(item)) {
    if (Array.isArray(fieldVal) && fieldVal.length > 0) {
      if (collections[fieldKey]) {
        result[fieldKey] = new Set(fieldVal);
      }
    }
  }
  return result;
}

/**
 * hasAnyReferenceIntersection(refMapA, refMapB):
 * - refMapA, refMapB are objects like { services: Set(...), team: Set(...) }
 * We return true if there's any *same collection key* with a shared slug in that set.
 */
export function hasAnyReferenceIntersection(refMapA, refMapB) {
  // For each collection in refMapA, see if refMapB has the same collection
  // and if there's any intersection in those sets
  for (const colKey of Object.keys(refMapA)) {
    if (!refMapB[colKey]) continue;
    // If the two sets share at least one value, we consider it an intersection
    for (const slugA of refMapA[colKey]) {
      if (refMapB[colKey].has(slugA)) {
        return true;
      }
    }
  }
  return false;
}
