// src/utils/queries/relationalHelpers.js
import { collections } from "../../content/config";

/**
 * getDirectAndReverseRefs(item, colName):
 * - item: the current item object
 * - colName: e.g. "services", "projects", "testimonials", etc.
 *
 * Returns: { directRefs: [...], reverseRefs: [...] }
 *
 * - directRefs = items in colName that the current item references
 * - reverseRefs = items in colName that reference the current item
 */
export function getDirectAndReverseRefs(item, colName) {
  // If colName is null, we skip. Typically, colName is always a string in your queries.
  if (!colName || !collections[colName]) {
    return { directRefs: [], reverseRefs: [] };
  }

  let directRefs = [];
  const allTargetItems = collections[colName].data;

  // 1) Direct: item[colName] is an array of slugs referencing that collection
  if (Array.isArray(item[colName])) {
    directRefs = item[colName]
      .map((refSlug) => allTargetItems.find((t) => t.slug === refSlug))
      .filter(Boolean);
  }

  // 2) Reverse: any item in colName referencing this `item.slug`
  const reverseRefs = allTargetItems.filter((targetItem) => {
    // For each property in that item, if it's an array and includes the current slug, it references us
    return Object.values(targetItem).some((val) => {
      return Array.isArray(val) && val.includes(item.slug);
    });
  });

  return { directRefs, reverseRefs };
}

/**
 * extractReferencesToOtherCollections(item):
 * Returns an object like:
 * {
 *   services: Set([...]),
 *   projects: Set([...]),
 *   testimonials: Set([...]),
 *   ...
 * }
 * Each key is a *valid* collection name that this item references,
 * and the value is a Set of slugs from that collection.
 */
export function extractReferencesToOtherCollections(item) {
  const result = {};
  for (const [fieldKey, fieldVal] of Object.entries(item)) {
    if (Array.isArray(fieldVal) && fieldVal.length > 0) {
      // Check if fieldKey is a valid collection
      if (collections[fieldKey]) {
        result[fieldKey] = new Set(fieldVal);
      }
    }
  }
  return result;
}

/**
 * hasAnyReferenceIntersection(refMapA, refMapB):
 * - refMapA, refMapB are objects like { services: Set(...), projects: Set(...), ... }
 * - Returns `true` if they share at least one slug in the same collection key.
 */
export function hasAnyReferenceIntersection(refMapA, refMapB) {
  for (const colKey of Object.keys(refMapA)) {
    if (!refMapB[colKey]) continue;
    // Check if the two sets share any slug
    for (const slugA of refMapA[colKey]) {
      if (refMapB[colKey].has(slugA)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * findMultiHopReferences(currentItem, currentCollection, targetCollection):
 *
 * - currentItem: The item we are on (e.g., a "service" or "project")
 * - currentCollection: The collection that currentItem belongs to
 * - targetCollection: The collection we want to find items in
 *
 * Steps:
 *   1) Gather direct+reverse references to targetCollection
 *   2) Attempt multi-hop bridging: from currentItem => "any other collection" => targetCollection
 *   3) Return a combined, deduplicated array of items in the targetCollection.
 */
export function findMultiHopReferences(
  currentItem,
  currentCollection,
  targetCollection
) {
  // 1) Direct + reverse references
  const { directRefs, reverseRefs } = getDirectAndReverseRefs(
    currentItem,
    targetCollection
  );
  let combined = [...directRefs, ...reverseRefs];

  // 2) Multi-hop references
  // For each other collection, gather bridging items. Then from those bridging items,
  // gather references to targetCollection.
  const multiHopResults = [];
  const allCollectionNames = Object.keys(collections);

  for (const possibleCol of allCollectionNames) {
    // Skip if it’s the current or the target
    if (possibleCol === currentCollection || possibleCol === targetCollection) {
      continue;
    }

    // For each bridging item in "possibleCol" that references or is referenced by currentItem:
    const { directRefs: directBridge, reverseRefs: reverseBridge } =
      getDirectAndReverseRefs(currentItem, possibleCol);

    const bridgingItems = [...directBridge, ...reverseBridge];
    for (const bItem of bridgingItems) {
      const { directRefs: dr2, reverseRefs: rr2 } = getDirectAndReverseRefs(
        bItem,
        targetCollection
      );
      multiHopResults.push(...dr2, ...rr2);
    }
  }

  combined = [...combined, ...multiHopResults];

  // Remove duplicates
  const unique = Array.from(new Set(combined));
  return unique;
}

/**
 * findSameCollectionReferences(currentItem, collectionName):
 *
 * - For items in the *same* collection, we gather:
 *    1) Items that share references to other collections (shared references).
 *    2) Direct + reverse references if the item references itself in some unusual scenario.
 */
export function findSameCollectionReferences(currentItem, collectionName) {
  const sameCollection = collections[collectionName].data;
  const sameColResults = [];

  // Gather all references of the current item that point to *other* collections
  const referencesByCollection =
    extractReferencesToOtherCollections(currentItem);

  for (const otherItem of sameCollection) {
    if (otherItem.slug === currentItem.slug) continue;
    const otherRefs = extractReferencesToOtherCollections(otherItem);

    if (hasAnyReferenceIntersection(referencesByCollection, otherRefs)) {
      sameColResults.push(otherItem);
    }
  }

  // Also handle direct + reverse references in the same collection
  const { directRefs, reverseRefs } = getDirectAndReverseRefs(
    currentItem,
    collectionName
  );
  const combined = [...sameColResults, ...directRefs, ...reverseRefs];

  // De-duplicate
  const unique = Array.from(new Set(combined));
  return unique;
}

/**
 * fetchRelationalData(collectionName, slug):
 *
 * - If you want a quick “direct + reverse references” for a single item
 *   you can call this function.
 * - Returns an object with shape:
 *      { direct: { services: [...], projects: [...] },
 *        reverse: { services: [...], ... },
 *        currentItem: { ...the item... } }
 */
export async function fetchRelationalData(collectionName, slug) {
  const colObj = collections[collectionName];
  if (!colObj) {
    throw new Error(`No data found for collection "${collectionName}".`);
  }

  // current item
  const currentItem = colObj.data.find((item) => item.slug === slug);
  if (!currentItem) {
    throw new Error(
      `Item with slug "${slug}" not found in "${collectionName}".`
    );
  }

  // Direct references by other collection names
  const direct = {};
  for (const [fieldKey, fieldVal] of Object.entries(currentItem)) {
    if (
      Array.isArray(fieldVal) &&
      fieldVal.length > 0 &&
      collections[fieldKey]
    ) {
      direct[fieldKey] = fieldVal
        .map((refSlug) =>
          collections[fieldKey].data.find((i) => i.slug === refSlug)
        )
        .filter(Boolean);
    }
  }

  // Reverse references: for each other collection, find items that reference us
  const reverse = {};
  for (const otherColName of Object.keys(collections)) {
    const colData = collections[otherColName].data;
    if (!colData) continue;

    const referencing = colData.filter((itm) => {
      // For each property in that item, if it's an array and includes slug, it references us
      return Object.values(itm).some(
        (val) => Array.isArray(val) && val.includes(slug)
      );
    });

    if (referencing.length > 0) {
      reverse[otherColName] = referencing;
    }
  }

  return { direct, reverse, currentItem };
}

/* ------------------------------------------------------------------
   NEW: aggregator logic for collection-level references
   if slug is missing, we want to gather references across all items 
   in `currentCollection` that point to `targetCollection`.
------------------------------------------------------------------ */
export function aggregateCollectionLevelReferences(currentCollectionName, targetCollectionName) {
  // 1) Confirm the collection actually exists
  const currentColObj = collections[currentCollectionName];
  if (!currentColObj) return [];

  // 2) Gather all items from the current collection
  const allItemsInCurrent = currentColObj.data;
  const aggregatorSet = new Set();

  for (const item of allItemsInCurrent) {
    // CROSS-COLLECTION references:
    if (targetCollectionName !== currentCollectionName) {
      const multiHopItems = findMultiHopReferences(item, currentCollectionName, targetCollectionName);
      for (const refItem of multiHopItems) {
        aggregatorSet.add(refItem);
      }
    } else {
      // SAME-COLLECTION references:
      const sameColItems = findSameCollectionReferences(item, targetCollectionName);
      for (const refItem of sameColItems) {
        aggregatorSet.add(refItem);
      }
    }
  }

  return Array.from(aggregatorSet);
}