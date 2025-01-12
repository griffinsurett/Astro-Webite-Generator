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

export function getAllConnectedItemsOfCollection(
  startItem,
  targetCollectionName,
  visited = new Set()
) {
  // The final set of items found in `targetCollectionName`
  const foundItems = new Set();

  // Each "node" in this graph is effectively "an item from some collection."
  // We'll track them by a pseudo-identifier: "<collectionName>:<slug>"
  // so we can mark them visited.
  const queue = [];

  // We need to know *which collection* the startItem belongs to, so we can properly
  // gather direct/reverse references. We might store that on the item or pass it in.
  // For convenience, we'll just store a fake key in the item (we'll see below how).
  queue.push(startItem);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || !current.___collectionName) continue; // skip if missing

    const currentKey = `${current.___collectionName}:${current.slug}`;
    if (visited.has(currentKey)) {
      continue; // we’ve already processed this item
    }
    visited.add(currentKey);

    // If the current item belongs to targetCollectionName, add it to foundItems.
    if (current.___collectionName === targetCollectionName) {
      foundItems.add(current);
      // We continue traversal in case we find *other* items too (if needed).
    }

    // 1) Gather direct references from `current` to other collections
    const { directRefs } = getDirectAndReverseRefs(current, null /* pass null to get all? */);

    // 2) Gather reverse references from all possible collections
    //    We do a small tweak: if colName is null, we want *reverse references* from *every* collection.
    const { reverseRefsAll } = getAllReverseRefs(current);

    // Enqueue them, but we must attach the `___collectionName` to each item so we know
    // how to handle it in the next iteration:
    for (const refItem of directRefs) {
      queue.push(refItem);
    }
    for (const refItem of reverseRefsAll) {
      queue.push(refItem);
    }
  }

  return foundItems;
}